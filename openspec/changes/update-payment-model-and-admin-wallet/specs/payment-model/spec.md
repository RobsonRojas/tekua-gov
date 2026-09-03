# Capability: Update Payment Model and Admin Wallet Control

## Requirements

### CHANGED: Task Payout Model
- The system MUST NOT deduct funds from the requester's or beneficiary's wallet when an activity is confirmed.
- The system MUST mint funds (or transfer from the system Treasury/null wallet) and deposit them into the executor's wallet upon activity confirmation.

#### Scenario: Activity Completion
- **Given** an activity is pending validation
- **When** the required confirmations are met (community or requester approval)
- **Then** the executor receives the reward amount in their wallet
- **And** the requester's wallet balance remains completely unaffected.

### ADDED: Admin Wallet Balance Management
- The Admin Panel MUST provide a feature to adjust a member's wallet balance.
- An Administrator MUST be able to define the amount and a justification for the adjustment.
- The system MUST log this manual adjustment appropriately in the ledger.

#### Scenario: Admin Adjusts Wallet Balance
- **Given** a user is logged in as an Administrator
- **When** they navigate to the Admin Panel and select to adjust a member's wallet
- **Then** they can input an amount and justification
- **And** the member's wallet balance is updated accordingly.
