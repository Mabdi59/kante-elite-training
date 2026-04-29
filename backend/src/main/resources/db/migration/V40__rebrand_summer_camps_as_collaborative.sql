-- V40: Rebrand summer camp events as a collaborative Kante Elite Training offering.
-- Both weeks are part of the same summer program led by Coach Kante and Coach Tony together,
-- so we update titles, descriptions, and coach attribution accordingly.

UPDATE events
SET
    title       = 'Kante Elite Summer Camp — Week 1',
    description = 'Week one of Kante Elite Training''s signature summer program, led by Coach Kante and Coach Tony. Five days of intensive technical training, game intelligence work, speed development, and competitive small-sided games. Coach Kante brings Division 2 college experience, G-MAC All-Conference honors, Somali National Team caps, and USSF licensing. Coach Tony adds Division 1 college and semi-professional experience across the U.S. and Sweden, plus UEFA and USSF credentials. Limited enrollment ensures every player receives direct attention and daily feedback from both coaches.',
    coach_name  = 'Coach Kante & Coach Tony'
WHERE title = 'Coach Kante Summer Elite Camp';

UPDATE events
SET
    title       = 'Kante Elite Summer Camp — Week 2',
    description = 'Week two of Kante Elite Training''s signature summer program, led by Coach Kante and Coach Tony. Five days of technical excellence, athletic performance, and the tactical intelligence needed to compete at higher levels. Coach Tony draws on Division 1 college play, semi-professional experience at Vagnharads VSK (Sweden) and Pittsburgh Riverhounds, and UEFA and USSF certification. Coach Kante contributes Division 2 college credentials, G-MAC All-Conference recognition, Somali National Team experience, and USSF licensing. Small group format guarantees focused attention and individual feedback for every player.',
    coach_name  = 'Coach Kante & Coach Tony'
WHERE title = 'Coach Tony Summer Training Sessions';
