## Purpose

Allow recipients of Surreais to share their reward experience publicly and inspire new members to discover demands and work opportunities.

## ADDED Requirements

### Requirement: Shareable received Surreais landing page
The system SHALL provide a public link that displays the amount of Surreais received by a member, a short motivational message, and a clear button to explore demands and work opportunities.

#### Scenario: Recipient generates a share link
- **WHEN** a member views a received Surreais entry and selects the share action
- **THEN** the system SHALL generate a public link that can be copied or shared outside the platform

#### Scenario: Visitor opens a shared Surreais landing page
- **WHEN** an unauthenticated visitor opens the shared link
- **THEN** the system SHALL display the amount received, the recipient's first name or display name, and a prominent button to navigate to the demands/work discovery page

#### Scenario: Shared link is invalid or expired
- **WHEN** a visitor opens a share link that does not exist or is no longer valid
- **THEN** the system SHALL display a friendly error message and offer a navigation option to the platform home or demands page

### Requirement: Motivating CTA from share landing page
The system SHALL make the shared page attractive to new members by presenting a motivational headline, a concise explanation of how Surreais are earned, and a button labeled with an action such as "Explore demands" or "Start earning Surreais".

#### Scenario: Visitor decides to explore work opportunities
- **WHEN** the visitor clicks the call-to-action button on the landing page
- **THEN** the system SHALL navigate the visitor to the main demands or work discovery page, using a public route if available
