/**
 * Gallery item data contracts following Constitution Brendup Title II and Title V.
 */

/// <summary>
/// Core gallery item model representing artwork in Specku's portfolio.
/// Pure data model without methods or functions per Constitution Brendup Art. 2.2.
/// All public properties adhere strictly to PascalCase with uppercase ID (Art. 12.3).
/// Non-string primitive types are encapsulated as nullable (Art. 14).
/// </summary>
export interface GalleryItemBase {
  /// <summary>
  /// Internal numeric database primary key identifier.
  /// </summary>
  GalleryItemID: number | null;

  /// <summary>
  /// External unique alphanumeric key exposed to consumers.
  /// </summary>
  Key: string | null;

  /// <summary>
  /// Artwork display title.
  /// </summary>
  Title: string | null;

  /// <summary>
  /// Binary image payload encoded as a Base64 data URL (e.g. data:image/webp;base64,...).
  /// </summary>
  ImageBinary: string | null;

  /// <summary>
  /// Alternative descriptive text for screen readers and accessibility.
  /// </summary>
  AltText: string | null;

  /// <summary>
  /// Classification or category grouping of the artwork.
  /// </summary>
  Category: string | null;

  /// <summary>
  /// Sequential sort order index for display.
  /// </summary>
  Order: number | null;

  /// <summary>
  /// Flag indicating whether the artwork item is currently active and visible.
  /// </summary>
  IsActive: boolean | null;

  /// <summary>
  /// Logical deletion flag per Constitution Brendup Art. 22.2.
  /// </summary>
  IsDeleted: boolean | null;
}
