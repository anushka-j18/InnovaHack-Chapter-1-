from typing import TypedDict, List, Literal, Annotated
import operator


class SourceInfo(TypedDict):
    url: str
    reliability: Literal["high", "medium", "low"]


class AttemptRecord(TypedDict):
    """One entry in a claim's history — snapshot taken right before a re-research loop fires."""
    attempt_count: int
    verification_status: str
    severity: str
    notes: str


class ClaimState(TypedDict):
    """
    Mirrors the 'Claim State Object' from the briefing doc (claim, source_url,
    verification_status, severity, attempt_count, history) — extended with a
    `sources` list (multiple sources, each tiered by reliability) instead of a
    single source_url, plus confidence_score/confidence_reasoning for the
    per-claim confidence matrix in the final report.
    """
    claim: str
    sources: List[SourceInfo]
    verification_status: Literal["confirmed", "partially_confirmed", "contradicted", "unverifiable"]
    severity: Literal["high", "medium", "low", "none"]
    hallucination_flag: bool
    confidence_score: int
    confidence_reasoning: str
    attempt_count: int
    history: List[AttemptRecord]


class OverallState(TypedDict):
    topic: str
    initial_claims: List[str]
    # Annotated with operator.add so each parallel per-claim branch appends
    # its result here instead of overwriting the others (map-reduce pattern).
    resolved_claims: Annotated[List[ClaimState], operator.add]
    final_report: str
