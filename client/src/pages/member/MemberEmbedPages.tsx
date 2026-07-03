import { MemberPageWrapper } from "@/components/MemberPageWrapper";
import { ForumPage } from "@/pages/ForumPage";
import { LessonsPage } from "@/pages/LessonsPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { CompetitionsPage } from "@/pages/CompetitionsPage";
import { ExpertQAPage } from "@/pages/ExpertQAPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { DealsPage } from "@/pages/DealsPage";
import { CalendarsPage } from "@/pages/CalendarsPage";
import { SelfDiagnosisPage } from "@/pages/SelfDiagnosisPage";
import { CarePlansPage } from "@/pages/CarePlansPage";
import { GrassTypesPage } from "@/pages/GrassTypesPage";
import { ChatPage } from "@/pages/ChatPage";
import { DiagnosisPage } from "@/pages/DiagnosisPage";

export function MemberForumPage() {
  return (
    <MemberPageWrapper
      premiumRequired
      paywallTitle="Community Forum"
      paywallDescription="Premium members can join discussions, post, and comment — same as the mobile app forum tab."
    >
      <ForumPage embedded />
    </MemberPageWrapper>
  );
}

export function MemberLessonsPage() {
  return (
    <MemberPageWrapper
      premiumRequired
      paywallTitle="Video Lessons"
      paywallDescription="Watch expert video lessons from TurfguyRoss with a premium membership."
    >
      <LessonsPage embedded />
    </MemberPageWrapper>
  );
}

export function MemberLibraryPage() {
  return (
    <MemberPageWrapper
      premiumRequired
      paywallTitle="Lawn Library"
      paywallDescription="Download ebooks and reference guides with your premium membership."
    >
      <LibraryPage embedded />
    </MemberPageWrapper>
  );
}

export function MemberCompetitionsPage() {
  return (
    <MemberPageWrapper
      premiumRequired
      paywallTitle="Lawn Contests"
      paywallDescription="Enter competitions and vote on entries with a premium membership."
    >
      <CompetitionsPage embedded />
    </MemberPageWrapper>
  );
}

export function MemberExpertQAPage() {
  return (
    <MemberPageWrapper
      premiumRequired
      paywallTitle="Ask TurfguyRoss"
      paywallDescription="Premium members can ask questions and chat with the expert team."
    >
      <ExpertQAPage embedded />
    </MemberPageWrapper>
  );
}

export function MemberProfilePage() {
  return (
    <MemberPageWrapper>
      <ProfilePage embedded />
    </MemberPageWrapper>
  );
}

export function MemberDealsPage() {
  return (
    <MemberPageWrapper>
      <DealsPage embedded />
    </MemberPageWrapper>
  );
}

export function MemberCalendarsPage() {
  return (
    <MemberPageWrapper
      premiumRequired
      paywallTitle="Lawn Care Calendars"
      paywallDescription="Regional lawn care calendars and PDF guides are included with premium."
    >
      <CalendarsPage embedded />
    </MemberPageWrapper>
  );
}

export function MemberSelfDiagnosisPage() {
  return (
    <MemberPageWrapper
      premiumRequired
      paywallTitle="Self Diagnosis"
      paywallDescription="Walk through the lawn problem wizard with a premium membership."
    >
      <SelfDiagnosisPage embedded />
    </MemberPageWrapper>
  );
}

export function MemberCarePlansPage() {
  return (
    <MemberPageWrapper>
      <CarePlansPage embedded />
    </MemberPageWrapper>
  );
}

export function MemberGrassTypesPage() {
  return (
    <MemberPageWrapper>
      <GrassTypesPage embedded />
    </MemberPageWrapper>
  );
}

export function MemberChatPage() {
  return (
    <MemberPageWrapper>
      <ChatPage embedded />
    </MemberPageWrapper>
  );
}

export function MemberDiagnosisPage() {
  return (
    <MemberPageWrapper
      premiumRequired
      paywallTitle="AI Weed ID"
      paywallDescription="Upload photos for AI-powered weed and turf identification with premium."
    >
      <DiagnosisPage embedded />
    </MemberPageWrapper>
  );
}
