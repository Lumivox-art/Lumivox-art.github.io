/**
 * Base response structure following Constitution Brendup Title III (Art. 8).
 */

/// <summary>
/// Non-generic base response contract containing server status metadata.
/// Pure data model with zero methods per Constitution Brendup Art. 2.2.
/// </summary>
export interface ResponseBase {
  /// <summary>
  /// Numeric HTTP-compliant status code (e.g. 200, 302, 400, 500).
  /// </summary>
  CodeNumber: number | null;

  /// <summary>
  /// Standard status code descriptor name (e.g. "OK", "Found", "BadRequest").
  /// </summary>
  CodeName: string | null;

  /// <summary>
  /// Optional server or diagnostic message.
  /// </summary>
  Message: string | null;

  /// <summary>
  /// Optional error code number when an error occurs.
  /// </summary>
  ErrorNumber: number | null;

  /// <summary>
  /// Identifier of the serving node or service name.
  /// </summary>
  ServerName: string | null;
}

/// <summary>
/// Generic transactional response wrapping payload of type T.
/// Pure data container with zero methods per Constitution Brendup Art. 2.2.
/// </summary>
export interface ResponseObject<T> extends ResponseBase {
  /// <summary>
  /// Result payload of type T.
  /// </summary>
  Result: T | null;
}
