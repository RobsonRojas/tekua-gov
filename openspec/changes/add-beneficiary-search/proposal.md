# Proposal: Add Search to Beneficiary Selection

## The Problem
When selecting a beneficiary for a new work or contribution, the user is presented with a standard dropdown list. As the number of members in the platform grows, scrolling through this list becomes inefficient and frustrating. 

## The Solution
Replace the standard dropdown (`<Select>`) for the Beneficiary field with a searchable component, such as MUI's `<Autocomplete>`. This will allow the user to type the name of the beneficiary and quickly filter the options.

## Key Features
- Searchable dropdown for beneficiary selection.
- Works correctly on both mobile and desktop.
- Keeps the current logic of submitting the correct `profile.id` under the hood.
