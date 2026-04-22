-- USERS
CREATE TABLE IF NOT EXISTS  users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROFILES (1:1)
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url TEXT
);

-- SCORES (1:M)
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (first_name, last_name, email, password) VALUES
('Андрій', 'Шевченко', 'andriy.shevchenko@example.com', '$2b$10$E9s5qZqZqZqZqZqZqZqZqu5qZqZqZqZqZqZqZqZqZqZqZqZqZq'),  -- password: test123
('Олена', 'Мельник', 'olena.melnyk@example.com', '$2b$10$E9s5qZqZqZqZqZqZqZqZqu5qZqZqZqZqZqZqZqZqZqZqZqZqZq'),
('Михайло', 'Коваленко', 'mykhailo.kovalenko@example.com', '$2b$10$E9s5qZqZqZqZqZqZqZqZqu5qZqZqZqZqZqZqZqZqZqZqZqZqZq'),
('Ірина', 'Бондаренко', 'iryna.bondarenko@example.com', '$2b$10$E9s5qZqZqZqZqZqZqZqZqu5qZqZqZqZqZqZqZqZqZqZqZqZqZq'),
('Володимир', 'Ткаченко', 'volodymyr.tkachenko@example.com', '$2b$10$E9s5qZqZqZqZqZqZqZqZqu5qZqZqZqZqZqZqZqZqZqZqZqZqZq'),
('Наталія', 'Кравчук', 'nataliia.kravchuk@example.com', '$2b$10$E9s5qZqZqZqZqZqZqZqZqu5qZqZqZqZqZqZqZqZqZqZqZqZqZq'),
('Дмитро', 'Лисенко', 'dmytro.lysenko@example.com', '$2b$10$E9s5qZqZqZqZqZqZqZqZqu5qZqZqZqZqZqZqZqZqZqZqZqZqZq'),
('Оксана', 'Мороз', 'oksana.moroz@example.com', '$2b$10$E9s5qZqZqZqZqZqZqZqZqu5qZqZqZqZqZqZqZqZqZqZqZqZqZq');


INSERT INTO profiles (user_id, bio, avatar_url) VALUES
(1, 'Колишній футболіст, тренер та громадський діяч.', 'https://randomuser.me/api/portraits/men/1.jpg'),
(2, 'Архітекторка та дизайнерка інтерʼєрів.', 'https://randomuser.me/api/portraits/women/2.jpg'),
(3, 'Розробник ПЗ з 10-річним досвідом.', 'https://randomuser.me/api/portraits/men/3.jpg'),
(4, 'Викладачка української мови та літератури.', 'https://randomuser.me/api/portraits/women/4.jpg'),
(5, 'Підприємець у сфері логістики.', 'https://randomuser.me/api/portraits/men/5.jpg'),
(6, 'Лікарка-педіатр, мама двох дітей.', 'https://randomuser.me/api/portraits/women/6.jpg'),
(7, 'Музикант та звукорежисер.', 'https://randomuser.me/api/portraits/men/7.jpg'),
(8, 'Журналістка та блогерка.', 'https://randomuser.me/api/portraits/women/8.jpg');

INSERT INTO scores (user_id, score) VALUES
-- Андрій Шевченко (id=1)
(1, 95), (1, 88), (1, 92), (1, 87),
-- Олена Мельник (id=2)
(2, 75), (2, 82), (2, 79),
-- Михайло Коваленко (id=3)
(3, 100), (3, 98), (3, 95), (3, 99), (3, 97),
-- Ірина Бондаренко (id=4)
(4, 88), (4, 85), (4, 90),
-- Володимир Ткаченко (id=5)
(5, 60), (5, 65), (5, 58), (5, 62),
-- Наталія Кравчук (id=6)
(6, 92), (6, 94), (6, 89), (6, 96),
-- Дмитро Лисенко (id=7)
(7, 78), (7, 82), (7, 80),
-- Оксана Мороз (id=8)
(8, 85), (8, 87), (8, 84), (8, 88), (8, 86);

-- Всі користувачі з профілями
SELECT u.id, u.first_name, u.last_name, u.email, p.bio, p.avatar_url
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.id;

-- Середній бал кожного користувача
SELECT u.id, u.first_name, u.last_name, 
       ROUND(AVG(s.score), 2) AS avg_score,
       COUNT(s.id) AS total_attempts
FROM users u
LEFT JOIN scores s ON u.id = s.user_id
GROUP BY u.id, u.first_name, u.last_name
ORDER BY avg_score DESC;

-- Загальна статистика
SELECT 
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM profiles) AS total_profiles,
    (SELECT COUNT(*) FROM scores) AS total_scores,
    (SELECT ROUND(AVG(score), 2) FROM scores) AS overall_average;