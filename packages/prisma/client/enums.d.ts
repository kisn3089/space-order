export declare const UserRole: {
    readonly INTERN: "INTERN";
    readonly ENGINEER: "ENGINEER";
    readonly ADMIN: "ADMIN";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
