CREATE TABLE IF NOT EXISTS faq_items (
    id BIGSERIAL PRIMARY KEY,
    question VARCHAR(220) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(80),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

INSERT INTO faq_items (question, answer, category, active, featured, display_order, created_at, updated_at)
VALUES
('What age groups do you train?', 'We train players from U8 through 18+. Every session is adjusted to the player''s age, current level, and development goals.', 'Training', TRUE, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('How do I book a session?', 'Open the Book page, choose your program, pick from live availability, and submit your player details. You will receive a confirmation email shortly after your booking is submitted.', 'Booking', TRUE, TRUE, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('What is your cancellation policy?', 'Please give at least 24 hours notice if you need to cancel or reschedule. Reach out through the Contact page or by phone and we will help you sort it out.', 'Booking', TRUE, TRUE, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Do you offer trial sessions?', 'Most families start with a single booked session so they can see the fit before scheduling more. Use the Book page to choose a program, date, and time directly.', 'Training', TRUE, FALSE, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Who leads the training?', 'Coach Kante leads the year-round training standards at Kante Elite. Select summer events also feature Coach Tony as part of the coaching staff.', 'Coaching', TRUE, FALSE, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('What should my child bring to sessions?', 'Players should bring cleats, shin guards, a water bottle, and athletic clothing. A ball is provided, but players can bring their own if they prefer.', 'Training', TRUE, TRUE, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('How many players are in a small group session?', 'Small group sessions are intentionally limited so every athlete gets personal coaching time, clear feedback, and enough repetition to improve.', 'Training', TRUE, TRUE, 70, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('How quickly will I see improvement?', 'Many players feel a difference after 3 to 4 focused sessions. Players who train consistently often show clear progress within 4 to 6 weeks.', 'Development', TRUE, TRUE, 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('How do tournament registrations work?', 'Teams can register online through the tournament pages. Start with team details, then use the Team Portal for roster updates, payment steps, and registration status.', 'Tournaments', TRUE, FALSE, 90, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Can parents watch training sessions?', 'Yes, parents are welcome to observe sessions from designated viewing areas. Transparency between coaches and parents supports better player development.', 'Training', TRUE, FALSE, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('What programs do you offer?', 'Current offerings include private training, small group training, and speed and agility work. Visit the Training page for the live program list and booking options.', 'Programs', TRUE, FALSE, 110, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('How do I contact the academy?', 'You can reach us through the Contact page, by email, or by phone. For urgent matters related to sessions starting soon, calling directly is best.', 'Support', TRUE, FALSE, 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
