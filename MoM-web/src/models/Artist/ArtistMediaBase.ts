/**
 * Artist media data contract following Constitution Brendup Title II and Title V.
 */

/// <summary>
/// Core artist media entity containing binary splash artwork and roster icon.
/// Pure data model with zero methods per Constitution Brendup Art. 2.2.
/// Public properties follow PascalCase with uppercase ID (Art. 12.3).
/// Non-string primitive types are encapsulated as nullable (Art. 14).
/// </summary>
export interface ArtistMediaBase {
  /// <summary>
  /// Internal numeric database primary key identifier.
  /// </summary>
  ArtistMediaID: number | null;

  /// <summary>
  /// External unique alphanumeric key (e.g. "luis-m", "specku", "sam", "joz").
  /// </summary>
  Key: string | null;

  /// <summary>
  /// Artist display name.
  /// </summary>
  Name: string | null;

  /// <summary>
  /// Binary splash artwork encoded as Base64 data URL (e.g. data:image/jpeg;base64,...).
  /// </summary>
  SplashBinary: string | null;

  /// <summary>
  /// Binary roster icon encoded as Base64 data URL (e.g. data:image/svg+xml;base64,...).
  /// </summary>
  IconBinary: string | null;

  /// <summary>
  /// Flag indicating whether the artist record is currently active.
  /// </summary>
  IsActive: boolean | null;

  /// <summary>
  /// Logical deletion flag per Constitution Brendup Art. 22.2.
  /// </summary>
  IsDeleted: boolean | null;
}
