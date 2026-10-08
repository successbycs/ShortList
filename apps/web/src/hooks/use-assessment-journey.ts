import { useServerFn } from "@tanstack/react-start";
import { useReducer, useRef, type FormEvent } from "react";

import {
  submitDomainAssessment,
  type DomainAssessmentSubmissionResult,
} from "@/functions/submit-domain-assessment";
import { admitPublicDomain } from "@/lib/domain-admission";
import type { StoredAssessmentResult } from "@/server/live-assessment";

export type AssessmentScreen = "entry" | "refusal" | "progress" | "reveal" | "result" | "failure";

type FailureResult = Extract<
  DomainAssessmentSubmissionResult,
  { kind: "assessment_unavailable" | "admission_rejected" | "limited" }
>;
export type JourneyState =
  | { screen: "entry"; domain: string; domainError: string }
  | { screen: "refusal"; domain: string }
  | { screen: "progress"; domain: string; requestId: number }
  | {
      screen: "reveal";
      domain: string;
      result: StoredAssessmentResult;
      email: string;
      emailError: string;
    }
  | { screen: "result"; domain: string; result: StoredAssessmentResult }
  | { screen: "failure"; domain: string; result: FailureResult };

type JourneyAction =
  | { type: "domain_changed"; value: string }
  | { type: "email_changed"; value: string }
  | { type: "domain_invalid"; error: string }
  | { type: "social_profile" }
  | { type: "submission_started"; domain: string; requestId: number }
  | { type: "submission_finished"; requestId: number; result: DomainAssessmentSubmissionResult }
  | { type: "email_invalid" }
  | { type: "report_revealed" }
  | { type: "reset" };

const initialState: JourneyState = {
  screen: "entry",
  domain: "lawnrite.co.nz",
  domainError: "",
};

function reducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case "domain_changed":
      return state.screen === "entry" ? { ...state, domain: action.value } : state;
    case "email_changed":
      return state.screen === "reveal" ? { ...state, email: action.value } : state;
    case "domain_invalid":
      return state.screen === "entry" ? { ...state, domainError: action.error } : state;
    case "social_profile":
      return { screen: "refusal", domain: state.screen === "entry" ? state.domain : "" };
    case "submission_started":
      return { screen: "progress", domain: action.domain, requestId: action.requestId };
    case "submission_finished":
      if (state.screen !== "progress" || state.requestId !== action.requestId) return state;
      if (action.result.kind === "completed" || action.result.kind === "cached")
        return {
          screen: "reveal",
          domain: state.domain,
          result: action.result.result,
          email: "",
          emailError: "",
        };
      if (action.result.kind === "invalid_input")
        return {
          screen: "entry",
          domain: state.domain,
          domainError: "Enter a public website address like yourbusiness.co.nz.",
        };
      return isFailureResult(action.result)
        ? { screen: "failure", domain: state.domain, result: action.result }
        : state;
    case "email_invalid":
      return state.screen === "reveal"
        ? { ...state, emailError: "Enter a valid email address." }
        : state;
    case "report_revealed":
      return state.screen === "reveal"
        ? { screen: "result", domain: state.domain, result: state.result }
        : state;
    case "reset":
      return { screen: "entry", domain: state.domain, domainError: "" };
  }
}

function isSocialProfile(domain: string): boolean {
  return ["facebook.com", "instagram.com"].some(
    (socialDomain) => domain === socialDomain || domain.endsWith(`.${socialDomain}`),
  );
}

function isFailureResult(result: DomainAssessmentSubmissionResult): result is FailureResult {
  return !["completed", "cached", "invalid_input"].includes(result.kind);
}

export function useAssessmentJourney() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const submitAssessment = useServerFn(submitDomainAssessment);
  const requestGeneration = useRef(0);

  async function submitDomain(event: FormEvent) {
    event.preventDefault();
    if (state.screen !== "entry") return;
    const admission = admitPublicDomain(state.domain);
    if (admission.kind === "rejected") {
      dispatch({
        type: "domain_invalid",
        error:
          admission.reasonCode === "private_or_local_target"
            ? "Enter a public business website, not a local or private address."
            : "Enter a public website address like yourbusiness.co.nz.",
      });
      return;
    }
    if (isSocialProfile(admission.normalisedDomain)) {
      dispatch({ type: "social_profile" });
      return;
    }
    const generation = ++requestGeneration.current;
    dispatch({
      type: "submission_started",
      domain: admission.normalisedDomain,
      requestId: generation,
    });
    try {
      const result = await submitAssessment({ data: { domain: admission.normalisedDomain } });
      if (generation !== requestGeneration.current) return;
      dispatch({
        type: "submission_finished",
        requestId: generation,
        result,
      });
    } catch {
      if (generation !== requestGeneration.current) return;
      dispatch({
        type: "submission_finished",
        requestId: generation,
        result: {
          kind: "assessment_unavailable",
          supportRef: "",
          diagnostic: { phase: "runtime", category: "unexpected_failure" },
        },
      });
    }
  }

  function revealReport(event: FormEvent) {
    event.preventDefault();
    if (state.screen !== "reveal") return;
    if (!state.email.includes("@") || !state.email.includes(".")) {
      dispatch({ type: "email_invalid" });
      return;
    }
    dispatch({ type: "report_revealed" });
  }

  return {
    state,
    setDomain: (value: string) => dispatch({ type: "domain_changed", value }),
    setEmail: (value: string) => dispatch({ type: "email_changed", value }),
    submitDomain,
    revealReport,
    reset: () => {
      requestGeneration.current += 1;
      dispatch({ type: "reset" });
    },
  };
}
