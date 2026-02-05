/**
 * Animation Library - Main Entry Point
 *
 * Centralized animation system for Dream Weaver Log
 * Includes particles, hooks, components, and utilities
 * 
 * Types are the single source of truth - particles only export functions
 */

// Types - Source of Truth for all interfaces
export * from "./types";

// Particle System Functions (namespace to avoid interface conflicts)
export * as ParticleSystems from "./particles";

// Hooks
export * from "./hooks";

// Components
export * from "./components";

// Utilities
export * from "./utils";
