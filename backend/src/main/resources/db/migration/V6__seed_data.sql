-- V6: Seed realistic starter data

-- Programs
INSERT INTO programs (name, slug, description, short_description, price, price_label, duration_minutes, features, icon, who_its_for, active, display_order)
VALUES
(
    'Private Training',
    'private',
    'Our flagship 1-on-1 private training sessions are designed to accelerate individual growth. Coach Kante works directly with your player to identify weaknesses, build on strengths, and develop a personalized curriculum that drives real results. Every session is filmed for analysis, and detailed feedback reports are shared after each session so your athlete is always improving with purpose.',
    'Personalized 1-on-1 coaching sessions built around your player''s unique goals.',
    75.00,
    '$75 / session',
    60,
    'Personalized curriculum tailored to your goals|Video analysis and performance feedback|Flexible scheduling to fit your lifestyle|Suitable for all skill levels (Beginner to Elite)|Progress tracking and milestone reviews|Parent/player feedback reports after every session',
    '⚽',
    'Perfect for any player who wants accelerated individual growth — from beginners building fundamentals to advanced athletes preparing for club or college.',
    TRUE,
    1
),
(
    'Small Group Training',
    'group',
    'Train alongside 2–4 peers of similar age and skill level. Small group sessions combine individual attention with the competitive energy of group training. Players push each other, learn from each other, and develop team-oriented habits that translate directly to match performance.',
    'High-intensity group sessions with 2–4 players. Competitive energy, personal attention.',
    40.00,
    '$40 / player',
    75,
    '2–4 players per session for focused, personal attention|Competitive training environment built for growth|Team chemistry and communication development|Cost-effective alternative to private sessions|Ages 8–18 welcome|Peer accountability and motivation',
    '👥',
    'Ideal for teammates, siblings, or friends who want to push each other while still getting meaningful individual coaching attention.',
    TRUE,
    2
),
(
    'Speed & Agility',
    'speed',
    'Dominate on the field with elite athletic conditioning. Our Speed & Agility program is built around proven sports science principles to improve your acceleration, lateral quickness, change-of-direction, and overall athleticism. This program creates faster, more explosive athletes.',
    'Athletic performance training designed to make players faster, quicker, and more explosive.',
    50.00,
    '$50 / session',
    60,
    'Linear and lateral speed development|Advanced agility ladder and cone drills|Strength and conditioning fundamentals|Injury prevention and flexibility work|Plyometric training for explosive power|Soccer-specific athletic movement patterns',
    '⚡',
    'Built for players looking to gain a serious athletic edge — whether you''re working to make the starting lineup, earn a scholarship, or simply outrun your opponents.',
    TRUE,
    3
),
(
    'Technical Development',
    'technical',
    'Master the technical foundation of the beautiful game. From first touch to finishing, our Technical Development program covers every aspect of individual ball mastery required to compete at the highest levels. Sessions focus on deliberate repetition, progressive challenge, and game-realistic scenarios.',
    'Master ball control, passing, shooting, and 1v1 skills through structured technical training.',
    45.00,
    '$45 / session',
    60,
    'Ball control and first touch mastery|Passing accuracy and weight of pass|Shooting technique and finishing|Advanced dribbling and feints|Positional skills development|1v1 attacking and defending scenarios',
    '🎯',
    'Perfect for technically developing players who want to sharpen their fundamentals and add elite-level skill moves to their game.',
    TRUE,
    4
),
(
    'Training Camps',
    'camps',
    'Immerse yourself in soccer excellence with our intensive week-long training camps. Designed to provide a transformative experience, camps combine high-volume training with tactical education, video sessions, and team activities. Players who attend camps consistently show the biggest single-week improvements of any program we offer.',
    'Full-week immersive soccer camps for serious development. High volume, high results.',
    200.00,
    '$200 / week',
    480,
    'Full-day structured training (8am–4pm)|Guest coaches and professional player appearances|Game situation and small-sided game sessions|Tactical and positional workshops|Certificate of completion|Team building activities and culture',
    '🏕️',
    'Ideal for dedicated players aged 8–18 who are serious about taking a major step forward in their development during school breaks.',
    TRUE,
    5
);

-- Events
INSERT INTO events (title, description, location, venue, start_date, end_date, age_group, spots_total, spots_left, price, status, type, intensity, display_order)
VALUES
(
    'Summer Elite Camp 2026',
    'Our signature summer training camp returns for 2026. Five full days of elite technical training, tactical development, and competitive small-sided games. Guest speakers include former professional players. Certificates and awards ceremony on Friday.',
    'Columbus, Ohio',
    'Walnut Ridge Athletic Complex',
    '2026-06-23',
    '2026-06-27',
    'Ages 10–16',
    24,
    7,
    200.00,
    'OPEN',
    'Camp',
    'High',
    1
),
(
    'Speed & Power Bootcamp',
    'A two-day intensive athletic performance bootcamp focused on acceleration, change of direction, and soccer-specific strength. Athletes will be tested on Day 1 and re-tested on Day 2 to measure improvement. Limited spots for maximum coaching attention.',
    'Columbus, Ohio',
    'Ohio State Fairgrounds Field House',
    '2026-05-10',
    '2026-05-11',
    'Ages 12–18',
    16,
    4,
    120.00,
    'OPEN',
    'Bootcamp',
    'Intense',
    2
),
(
    'Private Training Clinic — Spring Session',
    'A half-day technical skills clinic designed for serious players who want to work directly with Coach Kante in a structured group environment. Emphasis on 1v1, ball mastery, and finishing.',
    'Columbus, Ohio',
    'Kante Elite Training Center',
    '2026-04-19',
    NULL,
    'Ages 8–14',
    12,
    3,
    75.00,
    'OPEN',
    'Clinic',
    'Moderate',
    3
),
(
    'Elite Goalkeeper Training Day',
    'Specialized full-day goalkeeper training with positional coaching, shot-stopping technique, distribution, and 1v1 handling. Goalkeeper-only session designed for those who take the position seriously.',
    'Columbus, Ohio',
    'Blendon Woods Soccer Complex',
    '2026-05-31',
    NULL,
    'Ages 10–17',
    8,
    0,
    90.00,
    'SOLD_OUT',
    'Clinic',
    'High',
    4
);

-- Testimonials
INSERT INTO testimonials (name, role_or_context, quote, rating, featured, display_order)
VALUES
(
    'Marcus T.',
    'Parent of a U14 Player',
    'Coach Kante has done more for my son''s game in 3 months than the past two years of club training combined. The individual attention and the video feedback after each session is something we''ve never seen before. My son is more confident, faster, and technically miles ahead of where he was.',
    5,
    TRUE,
    1
),
(
    'Aisha B.',
    'U16 Player',
    'I was always nervous about my first touch under pressure. Coach Kante completely rebuilt my technique with a clear system. Now I''m one of the most composed players in my club. The training is hard but it works. I''ve already been called up for the state ODP program.',
    5,
    TRUE,
    2
),
(
    'Derrick & Pamela J.',
    'Parents of Twin Boys, Ages 12',
    'We enrolled both boys in small group training and the results shocked us. Within weeks, both were playing with more confidence and reading the game differently. Coach Kante explains things in a way kids actually understand. We''ve tried other academies — this is the real deal.',
    5,
    TRUE,
    3
),
(
    'Jordan W.',
    'U18 Player — College Scholarship Recipient',
    'I came to Coach Kante when I was being overlooked by college scouts. After one summer of private training, my first touch, my shooting, and my confidence were completely transformed. I just committed to play D2 soccer next year. I wouldn''t have gotten there without him.',
    5,
    TRUE,
    4
),
(
    'Sandra M.',
    'Parent of a U10 Player',
    'My daughter was shy and unsure about soccer. After just a few weeks with Coach Kante, she can''t stop playing. She comes home from training with so much energy and excitement. The way he builds confidence in young players is truly special.',
    5,
    TRUE,
    5
),
(
    'Coach DeShawn R.',
    'Club Team Head Coach',
    'I''ve referred several of my players to Coach Kante for individual development and every single one has come back dramatically improved. His technical curriculum is elite, his feedback is detailed, and the improvements are visible within weeks. He''s the best individual trainer in Columbus.',
    5,
    TRUE,
    6
);
