const CONDITIONS = ["new", "used", "certified"] as const;
export type Condition = typeof CONDITIONS[number];

export function isCondition(value: string): value is Condition {
  return (CONDITIONS as readonly string[]).includes(value);
}