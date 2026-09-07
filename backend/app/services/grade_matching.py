"""Deterministic, explainable grade-compatibility matching.

A buyer ``Demand`` expresses a ``minimum_grade`` requirement (e.g. "Grade A").
A ``ProduceLot`` carries a ``quality_grade`` (e.g. "Grade B"). This service
decides whether the lot satisfies the demand using three, easily-inspectable
categories defined in :class:`app.models.enums.GradeCompatibility`:

* ``exact``          - the lot grade matches the demand's minimum grade precisely.
* ``compatible``     - the lot grade exceeds the minimum requirement (better).
* ``incompatible``   - the lot grade is below the minimum requirement (worse).

Ranking is data-driven via ``DEFAULT_GRADE_RANKING`` (best -> worst) so the
rules can be inspected and modified in a single place without touching logic.
"""
from dataclasses import dataclass

from app.models.enums import GradeCompatibility


DEFAULT_GRADE_RANKING = [
    "GRADE A",
    "GRADE B",
    "GRADE C",
    "GRADE D",
]


def _normalize_grade(grade: str | None) -> str | None:
    if not grade:
        return None
    cleaned = grade.strip().upper()
    return cleaned or None


def _rank(grade: str, ranking: list[str]) -> int | None:
    try:
        return ranking.index(grade)
    except ValueError:
        return None


@dataclass
class GradeMatchResult:
    compatibility: GradeCompatibility
    reason: str
    lot_grade: str | None
    demand_minimum_grade: str | None


def evaluate_grade_compatibility(
    lot_grade: str | None,
    demand_minimum_grade: str | None,
    ranking: list[str] | None = None,
) -> GradeMatchResult:
    """Return the grade-compatibility result for a lot against a demand.

    ``ranking`` is best-to-worst; lower index == better grade.
    """
    ranking = ranking if ranking is not None else DEFAULT_GRADE_RANKING
    lot_norm = _normalize_grade(lot_grade)
    demand_norm = _normalize_grade(demand_minimum_grade)

    if demand_norm is None:
        return GradeMatchResult(
            compatibility=GradeCompatibility.compatible,
            reason="Demand has no minimum grade requirement; any grade is accepted.",
            lot_grade=lot_norm,
            demand_minimum_grade=demand_norm,
        )

    if lot_norm is None:
        return GradeMatchResult(
            compatibility=GradeCompatibility.incompatible,
            reason=f"Lot has no quality grade and cannot satisfy the '{demand_norm}' minimum requirement.",
            lot_grade=lot_norm,
            demand_minimum_grade=demand_norm,
        )

    lot_rank = _rank(lot_norm, ranking)
    demand_rank = _rank(demand_norm, ranking)

    if lot_rank is None and demand_rank is None:
        if lot_norm == demand_norm:
            return GradeMatchResult(
                compatibility=GradeCompatibility.exact,
                reason="Lot and demand grades are identical (unranked label matched verbatim).",
                lot_grade=lot_norm,
                demand_minimum_grade=demand_norm,
            )
        return GradeMatchResult(
            compatibility=GradeCompatibility.incompatible,
            reason=f"Grade '{lot_norm}' is not recognized and cannot be compared to '{demand_norm}'.",
            lot_grade=lot_norm,
            demand_minimum_grade=demand_norm,
        )

    if lot_rank is None:
        return GradeMatchResult(
            compatibility=GradeCompatibility.incompatible,
            reason=f"Lot grade '{lot_norm}' is not in the recognized ranking and cannot satisfy '{demand_norm}'.",
            lot_grade=lot_norm,
            demand_minimum_grade=demand_norm,
        )

    if demand_rank is None:
        return GradeMatchResult(
            compatibility=GradeCompatibility.incompatible,
            reason=f"Demand minimum grade '{demand_norm}' is not in the recognized ranking.",
            lot_grade=lot_norm,
            demand_minimum_grade=demand_norm,
        )

    if lot_rank == demand_rank:
        return GradeMatchResult(
            compatibility=GradeCompatibility.exact,
            reason=f"Lot grade '{lot_norm}' matches the demand minimum '{demand_norm}' exactly.",
            lot_grade=lot_norm,
            demand_minimum_grade=demand_norm,
        )

    if lot_rank < demand_rank:
        return GradeMatchResult(
            compatibility=GradeCompatibility.compatible,
            reason=f"Lot grade '{lot_norm}' (rank {lot_rank + 1}) exceeds the demand minimum '{demand_norm}' (rank {demand_rank + 1}).",
            lot_grade=lot_norm,
            demand_minimum_grade=demand_norm,
        )

    return GradeMatchResult(
        compatibility=GradeCompatibility.incompatible,
        reason=f"Lot grade '{lot_norm}' (rank {lot_rank + 1}) is below the demand minimum '{demand_norm}' (rank {demand_rank + 1}).",
        lot_grade=lot_norm,
        demand_minimum_grade=demand_norm,
    )


def is_grade_compatible(lot_grade: str | None, demand_minimum_grade: str | None) -> bool:
    """Convenience: True when the lot meets or exceeds the demand's minimum grade."""
    result = evaluate_grade_compatibility(lot_grade, demand_minimum_grade)
    return result.compatibility in (GradeCompatibility.exact, GradeCompatibility.compatible)
