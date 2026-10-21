/**
 * Artist media filter criteria model following Constitution Brendup Title II (Art. 4.3).
 */

/// <summary>
/// Filter criteria container for querying artist media records.
/// Pure data container with zero methods per Constitution Brendup Art. 2.2.
/// </summary>
export interface ArtistMediaFilter {
  /// <summary>
  /// When true, includes logically deleted records. Default is false.
  /// </summary>
  IncludeDeleted?: boolean | null;

  /// <summary>
  /// When true, only returns active records. Default is true.
  /// </summary>
  OnlyActive?: boolean | null;
}
