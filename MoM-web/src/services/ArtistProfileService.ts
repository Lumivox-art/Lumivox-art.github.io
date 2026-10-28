/**
 * Data access service for Artist Profile & Intranet operations.
 * Implements Constitution Brendup Title I (Art. 2.4), Title V (Art. 13), and Title VI (Art. 15).
 * Static class with pure static methods, zero throw statements, resilient local caching,
 * and reliable standard HTTP REST synchronization.
 */

import { LocalCache } from '../utils/LocalCache';
import type { ArtistProfile } from '../models/Artist';
import type { ResponseObject } from '../models/Response/ResponseObject';
import type { Artist, ArtistModule, SocialEntry } from '../data/artists';

export class ArtistProfileService {
  private static readonly cachePrefix = 'lvx_cache_artista_perfil_';
  private static readonly restBase =
    'https://multiverseofmadness21-fefd9-default-rtdb.firebaseio.com/artistas_perfiles';

  /**
   * Synchronously retrieves locally cached profile for an artist.
   */
  public static GetCachedProfile(handle: string): ArtistProfile | null {
    if (!handle) return null;
    return LocalCache.Get<ArtistProfile>(`${ArtistProfileService.cachePrefix}${handle}`);
  }

  /**
   * Synchronously hydrates artists list using locally cached profiles.
   */
  public static GetHydratedProfiles(defaultArtists: Artist[]): Artist[] {
    return defaultArtists.map((a) => {
      const cached = ArtistProfileService.GetCachedProfile(a.handle);
      return cached ? ArtistProfileService.HydrateArtist(a, cached) : a;
    });
  }

  /**
   * Fetches all remote artist profiles in one single query and updates local cache.
   */
  public static async LoadAllProfiles(
    onUpdated?: (profiles: Map<string, ArtistProfile>) => void,
  ): Promise<void> {
    try {
      const response = await fetch(`${ArtistProfileService.restBase}.json`);
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          const map = new Map<string, ArtistProfile>();
          for (const [key, val] of Object.entries(data)) {
            if (val && typeof val === 'object') {
              const prof = val as ArtistProfile;
              LocalCache.Set(`${ArtistProfileService.cachePrefix}${key}`, prof);
              map.set(key, prof);
            }
          }
          if (onUpdated) onUpdated(map);
        }
      }
    } catch {
      // Safe resilience against connection failure
    }
  }

  /**
   * Fetches the latest artist profile from Firebase RTDB via HTTPS REST.
   */
  public static async GetProfile(handle: string): Promise<ResponseObject<ArtistProfile | null>> {
    if (!handle) {
      return {
        CodeNumber: 400,
        CodeName: 'BadRequest',
        Message: 'Artist handle must be provided',
        ErrorNumber: 400,
        ServerName: 'local-validation',
        Result: null,
      };
    }

    const cached = ArtistProfileService.GetCachedProfile(handle);

    try {
      const url = `${ArtistProfileService.restBase}/${encodeURIComponent(handle)}.json`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          const profile: ArtistProfile = {
            handle: String(data.handle || handle),
            displayName: String(data.displayName || handle),
            tagline: String(data.tagline || ''),
            discipline: String(data.discipline || ''),
            bio: String(data.bio || ''),
            brief: data.brief ? String(data.brief) : undefined,
            accentColor: String(data.accentColor || '#8D3E2E'),
            socials: Array.isArray(data.socials) ? data.socials : [],
            updatedAt: Number(data.updatedAt) || Date.now(),
          };

          LocalCache.Set(`${ArtistProfileService.cachePrefix}${handle}`, profile);
          return {
            CodeNumber: 200,
            CodeName: 'OK',
            Message: null,
            ErrorNumber: null,
            ServerName: 'firebase-rest',
            Result: profile,
          };
        }

        return {
          CodeNumber: 404,
          CodeName: 'NotFound',
          Message: `No remote profile found for handle '${handle}'`,
          ErrorNumber: 404,
          ServerName: 'firebase-rest',
          Result: cached,
        };
      }

      return {
        CodeNumber: response.status,
        CodeName: 'HttpError',
        Message: `HTTP error fetching profile: ${response.status}`,
        ErrorNumber: response.status,
        ServerName: 'firebase-rest',
        Result: cached,
      };
    } catch (err) {
      console.warn(`[ArtistProfileService] Fetch failed for '${handle}':`, err);
      return {
        CodeNumber: 500,
        CodeName: 'NetworkError',
        Message: err instanceof Error ? err.message : String(err),
        ErrorNumber: 500,
        ServerName: 'firebase-rest',
        Result: cached,
      };
    }
  }

  /**
   * Saves or updates an artist profile in Firebase RTDB and local cache.
   */
  public static async SaveProfile(
    profile: ArtistProfile,
    idToken?: string,
  ): Promise<ResponseObject<boolean>> {
    if (!profile || !profile.handle) {
      return {
        CodeNumber: 400,
        CodeName: 'BadRequest',
        Message: 'Invalid profile data or missing handle',
        ErrorNumber: 400,
        ServerName: 'local-validation',
        Result: false,
      };
    }

    try {
      const authParam = idToken ? `?auth=${encodeURIComponent(idToken)}` : '';
      const url = `${ArtistProfileService.restBase}/${encodeURIComponent(profile.handle)}.json${authParam}`;

      const payload = {
        ...profile,
        updatedAt: Date.now(),
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        LocalCache.Set(`${ArtistProfileService.cachePrefix}${profile.handle}`, payload);
        return {
          CodeNumber: 200,
          CodeName: 'OK',
          Message: 'Profile updated successfully',
          ErrorNumber: null,
          ServerName: 'firebase-rest',
          Result: true,
        };
      }

      return {
        CodeNumber: response.status,
        CodeName: 'SaveFailed',
        Message: `Failed to save profile: HTTP ${response.status}`,
        ErrorNumber: response.status,
        ServerName: 'firebase-rest',
        Result: false,
      };
    } catch (err) {
      console.error(`[ArtistProfileService] Save error for '${profile.handle}':`, err);
      return {
        CodeNumber: 500,
        CodeName: 'InternalServerError',
        Message: err instanceof Error ? err.message : String(err),
        ErrorNumber: 500,
        ServerName: 'firebase-rest',
        Result: false,
      };
    }
  }

  /**
   * Merges a dynamic artist profile into an existing Artist definition without breaking fallback modules.
   */
  public static HydrateArtist(base: Artist, profile: ArtistProfile | null): Artist {
    if (!profile) return base;

    const modules: ArtistModule[] = [...base.modules];

    // If profile defines socials, update the socials module
    const socialsIdx = modules.findIndex((m) => m.kind === 'socials');
    if (socialsIdx >= 0 && profile.socials) {
      const existing = modules[socialsIdx];
      if (existing.kind === 'socials') {
        modules[socialsIdx] = {
          kind: 'socials',
          hidden: existing.hidden,
          entries: profile.socials as SocialEntry[],
        };
      }
    }

    // If profile defines a brief, update the brief module
    const briefIdx = modules.findIndex((m) => m.kind === 'brief');
    if (briefIdx >= 0 && profile.brief) {
      const existing = modules[briefIdx];
      if (existing.kind === 'brief') {
        modules[briefIdx] = {
          kind: 'brief',
          hidden: existing.hidden,
          body: profile.brief,
        };
      }
    }

    return {
      ...base,
      displayName: profile.displayName || base.displayName,
      tagline: profile.tagline || base.tagline,
      discipline: profile.discipline || base.discipline,
      bio: profile.bio || base.bio,
      accentColor: profile.accentColor || base.accentColor,
      modules,
    };
  }
}
