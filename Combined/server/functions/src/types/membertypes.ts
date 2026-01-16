export enum MemberType {
    TeamMember = "TeamMember",
    TeamCaptain = "TeamCaptain",
    ContentManager = "ContentManager",
    None = "None",
}

export interface Skill {
    id: string;
    name: string;
    category: string;
    description?: string;
    proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Group {
    name: string;
    captain: MemberProperties;
    members: MemberProperties[];
}

export interface MemberProperties {
    email: string;
    displayName: string;
    teams: Group[];
    photoURL: string;
    skillsOffered: Skill[];
    skillsSought: Skill[];
    bio?: string;
    location?: string;
    availability?: string[];
    immutable: {
        memberType: MemberType;
    };
}
