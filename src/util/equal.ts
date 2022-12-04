export function equal(o1: any, o2: any) {
  if (!o1) return false;
  if (!o2) return false;
  if (o1 === o2) return true;
  if (Array.isArray(o1) && Array.isArray(o2)) {
    if (o1.length !== o2.length) return false;
    for (let i = 0; i < o1.length; i++) {
      if (o1[i] !== o2[i]) return false;
    }
    return true;
  }
  if (typeof o1 === "object" && typeof o2 === "object") {
    for (const key of [...Object.keys(o1), ...Object.keys(o2)]) {
      if (o1[key] !== o2[key]) return false;
    }
    return true;
  }
  return false;
}
