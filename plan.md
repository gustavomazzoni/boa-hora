# Plan (Boa Hora app):

## Tasks:

1. [x] Break the Contractions timeline:
       User sees a break on the timeline for contractions spaced more than 60 minutes apart. The frequency between those contractions spaced more than 60 minutes apart should not be registered.
       UI: whenever the user logs a contraction spaced more than 60 minutes apart from the last, there should be a break at the timeline (new contraction log not connected with the previous one) and no frequency registered.

2. [x] Contraction logs grouped by date:
       User sees a date indicating the last contraction logged on that date.
       UI: At the Contractions timeline on top of the last contraction logged on the date, there should be the corresponding date at the "Hora" column with the same styles of the hour.

3. [x] Contraction log deletion:
       User can delete contractions log (as it can be made by mistake).
       UI: User long presses the duration information of the contraction he wants to delete at the Contractions timeline. The app asks user to confirm deletion. User can cancel or tap confirm and the app deletes the contraction log from the timeline.
       Write an unit test to ensure the logic works and covers edge cases.

4. [ ] Last Hour Contractions:
       Fix the last hour contractions calculation to take into consideration only the contractions logged in the last hour (60 min) from the time user is seeing the screen.
       Write an unit test to ensure the logic works and covers edge cases.

5. [ ] Go to Hospital Alert:
       Fix the implementation of the "5-1-1 rule", contractions are 5 minutes apart (Frequency), lasting 1 minute each (Duration), pattern persists for 1 hour. When it happens, the app enters the alert mode, where an alert notification appers guiding the user (pregnant women) to call her doctor and go to the hospital.
       Write an unit test to ensure the logic works and covers edge cases.

6. [ ] Contaction time limit:
       Contraction track button should automatically stop after 90 seconds (90 seconds limit) as until today (jan/2026) a contraction can take up to 90 seconds long.
       UI: User presses the "Contração começou" button and forgets (or couldn't) to press stop when the contraction stopped. User come back to the app and see a log tracking the contraction he initiated but didn't stop with a 90 seconds duration.
