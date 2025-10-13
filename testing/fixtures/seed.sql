-- Testing fixtures for LMSRoomReservations plugin
-- This file contains sample data for development and testing purposes
-- DO NOT include this in production builds

-- Sample Equipment
INSERT INTO __EQUIPMENT_TABLE__ (equipmentname, description, maxbookabletime) VALUES
('Projector', 'HD projector with HDMI connection', 480),
('Whiteboard', 'Large whiteboard with markers', NULL),
('Video Conference', 'Zoom-capable video conferencing system', 240),
('Laptop', 'Dell laptop with Windows 10', 180),
('Microphone', 'Wireless microphone system', NULL);

-- Sample Rooms
INSERT INTO __ROOMS_TABLE__ (roomnumber, maxcapacity, description, color, image, branch, maxbookabletime) VALUES
('Room 101', 10, 'Small meeting room with projector and whiteboard. Perfect for team meetings and presentations.', '#3498db', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', '__BRANCH__', 240),
('Room 202', 25, 'Large conference room with video conferencing capabilities. Ideal for larger meetings and workshops.', '#2ecc71', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400', '__BRANCH__', 480),
('Study Room A', 4, 'Quiet study room for small groups. Equipped with whiteboard.', '#e74c3c', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400', '__BRANCH__', 180),
('Study Room B', 4, 'Quiet study room for small groups. Equipped with whiteboard.', '#f39c12', 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400', '__BRANCH__', 180),
('Auditorium', 100, 'Large auditorium with stage, projector, and sound system. Perfect for events and presentations.', '#9b59b6', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400', '__BRANCH__', 480);

-- Link Equipment to Rooms
-- Room 101: Projector + Whiteboard
INSERT INTO __ROOMS_EQUIPMENT_TABLE__ (roomid, equipmentid)
SELECT r.roomid, e.equipmentid
FROM __ROOMS_TABLE__ r, __EQUIPMENT_TABLE__ e
WHERE r.roomnumber = 'Room 101' AND e.equipmentname IN ('Projector', 'Whiteboard');

-- Room 202: Projector + Whiteboard + Video Conference
INSERT INTO __ROOMS_EQUIPMENT_TABLE__ (roomid, equipmentid)
SELECT r.roomid, e.equipmentid
FROM __ROOMS_TABLE__ r, __EQUIPMENT_TABLE__ e
WHERE r.roomnumber = 'Room 202' AND e.equipmentname IN ('Projector', 'Whiteboard', 'Video Conference');

-- Study Room A: Whiteboard
INSERT INTO __ROOMS_EQUIPMENT_TABLE__ (roomid, equipmentid)
SELECT r.roomid, e.equipmentid
FROM __ROOMS_TABLE__ r, __EQUIPMENT_TABLE__ e
WHERE r.roomnumber = 'Study Room A' AND e.equipmentname = 'Whiteboard';

-- Study Room B: Whiteboard + Laptop
INSERT INTO __ROOMS_EQUIPMENT_TABLE__ (roomid, equipmentid)
SELECT r.roomid, e.equipmentid
FROM __ROOMS_TABLE__ r, __EQUIPMENT_TABLE__ e
WHERE r.roomnumber = 'Study Room B' AND e.equipmentname IN ('Whiteboard', 'Laptop');

-- Auditorium: Projector + Microphone + Video Conference
INSERT INTO __ROOMS_EQUIPMENT_TABLE__ (roomid, equipmentid)
SELECT r.roomid, e.equipmentid
FROM __ROOMS_TABLE__ r, __EQUIPMENT_TABLE__ e
WHERE r.roomnumber = 'Auditorium' AND e.equipmentname IN ('Projector', 'Microphone', 'Video Conference');

-- Sample Open Hours (Monday-Friday, 9am-5pm for the branch)
INSERT INTO __OPEN_HOURS_TABLE__ (`day`, `start`, `end`, `branch`) VALUES
(1, '09:00:00', '17:00:00', '__BRANCH__'),  -- Monday
(2, '09:00:00', '17:00:00', '__BRANCH__'),  -- Tuesday
(3, '09:00:00', '17:00:00', '__BRANCH__'),  -- Wednesday
(4, '09:00:00', '17:00:00', '__BRANCH__'),  -- Thursday
(5, '09:00:00', '17:00:00', '__BRANCH__');  -- Friday
