import { Doc, Id } from "@/convex/_generated/dataModel";

/**
 * Study Group with populated course data
 */
export interface StudyGroupWithCourse extends Doc<"studyGroups"> {
  course: Doc<"courses"> | null;
  organizer?: Doc<"users"> | null;
}

/**
 * Study Group with membership information
 */
export interface StudyGroupWithMembership extends StudyGroupWithCourse {
  membership?: Doc<"studyGroupMembers">;
}

/**
 * Study Group member with user data
 */
export interface StudyGroupMemberWithUser extends Doc<"studyGroupMembers"> {
  user: Doc<"users"> | null;
}

/**
 * Study Group with full details including members
 */
export interface StudyGroupDetails extends StudyGroupWithCourse {
  members: StudyGroupMemberWithUser[];
}

/**
 * Study Group message with user data
 */
export interface StudyGroupMessageWithUser extends Doc<"studyGroupMessages"> {
  user: Doc<"users"> | null;
}

/**
 * Study Group resource with uploader data
 */
export interface StudyGroupResourceWithUser extends Doc<"studyGroupResources"> {
  uploader: Doc<"users"> | null;
}

/**
 * Study Group invite with details
 */
export interface StudyGroupInviteWithDetails extends Doc<"friendInvites"> {
  group: Doc<"studyGroups"> | null;
  fromUser: Doc<"users"> | null;
  course: Doc<"courses"> | null;
}

/**
 * Shared content with user data
 */
export interface SharedContentWithUser extends Doc<"sharedContent"> {
  sharer: Doc<"users"> | null;
}

/**
 * Study together session with participants
 */
export interface StudySessionWithParticipants extends Omit<Doc<"studyTogetherSessions">, "participants"> {
  creator: Doc<"users"> | null;
  participants: (Doc<"users"> | null)[];
}

