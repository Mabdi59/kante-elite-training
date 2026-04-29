-- V39: Add coach_name to events and seed Coach Kante & Coach Tony summer training events

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS coach_name VARCHAR(100);

INSERT INTO events (title, description, location, venue, start_date, end_date, age_group, spots_total, spots_left, price, status, type, intensity, coach_name, display_order)
VALUES
(
    'Coach Kante Summer Elite Camp',
    'Five days of intensive individual and group training led personally by Coach Kante — former Division 2 player at Ohio Dominican University, G-MAC All-Conference honoree, three-time team MVP, Somali National Team player, and USSF licensed coach. Sessions cover technical mastery, game intelligence, speed development, and competitive small-sided games. Limited enrollment ensures every player receives direct coaching attention and daily feedback.',
    'Columbus, Ohio',
    'Walnut Ridge Athletic Complex',
    '2026-07-07',
    '2026-07-11',
    'Ages 10–16',
    18,
    18,
    225.00,
    'UPCOMING',
    'Camp',
    'High',
    'Coach Kante',
    5
),
(
    'Coach Tony Summer Training Sessions',
    'Specialized summer training led by Coach Tony — former Division 1 player at Wright State University, Semi-Pro at Vagnharads VSK (Sweden) and Pittsburgh Riverhounds, UEFA and USSF licensed coach at Reynoldsburg High School. Training focuses on technical excellence, athletic performance, and the tactical intelligence needed to compete at higher levels. Small group format ensures focused attention and individual feedback for every player.',
    'Columbus, Ohio',
    'Reynoldsburg Athletic Fields',
    '2026-07-14',
    '2026-07-18',
    'Ages 12–18',
    14,
    14,
    195.00,
    'UPCOMING',
    'Camp',
    'High',
    'Coach Tony',
    6
);
