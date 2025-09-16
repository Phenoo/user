/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ResendOTP from "../ResendOTP.js";
import type * as ResendOTPPasswordReset from "../ResendOTPPasswordReset.js";
import type * as assessments from "../assessments.js";
import type * as auth from "../auth.js";
import type * as courses from "../courses.js";
import type * as events from "../events.js";
import type * as flashcards from "../flashcards.js";
import type * as http from "../http.js";
import type * as seedFeatureLimits from "../seedFeatureLimits.js";
import type * as stripe from "../stripe.js";
import type * as studyGroups from "../studyGroups.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  ResendOTPPasswordReset: typeof ResendOTPPasswordReset;
  assessments: typeof assessments;
  auth: typeof auth;
  courses: typeof courses;
  events: typeof events;
  flashcards: typeof flashcards;
  http: typeof http;
  seedFeatureLimits: typeof seedFeatureLimits;
  stripe: typeof stripe;
  studyGroups: typeof studyGroups;
  subscriptions: typeof subscriptions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
