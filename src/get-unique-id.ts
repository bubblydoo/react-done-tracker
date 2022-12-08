const global = typeof window !== "undefined" ? (window as any) : {};
global._done_tracker_id = 0;

export const getUniqueId = () => global._done_tracker_id++;
