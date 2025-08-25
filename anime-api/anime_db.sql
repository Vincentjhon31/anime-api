-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 25, 2025 at 09:21 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `anime_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `anime`
--

CREATE TABLE `anime` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `year` int(11) DEFAULT NULL,
  `genres` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`genres`)),
  `author` varchar(255) DEFAULT NULL,
  `studio` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `anime`
--

INSERT INTO `anime` (`id`, `title`, `year`, `genres`, `author`, `studio`) VALUES
('a1', 'Sakamoto Days', 2020, '[\"Action\",\"Comedy\"]', 'Yuto Suzuki', 'TMS Entertainment'),
('a2', 'One Piece', 1999, '[\"Adventure\",\"Fantasy\"]', 'Eiichiro Oda', 'Toei Animation'),
('a3', 'That Time I Got Reincarnated as a Slime', 2018, '[\"Fantasy\",\"Isekai\"]', 'Fuse', '8bit'),
('a4', 'Demon Slayer: Kimetsu no Yaiba', 2019, '[\"Action\",\"Supernatural\"]', 'Koyoharu Gotouge', 'ufotable'),
('a5', 'Mushoku Tensei: Jobless Reincarnation', 2021, '[\"Fantasy\",\"Drama\"]', 'Rifujin na Magonote', 'Studio Bind'),
('a6', 'Dr. Stone', 2019, '[\"Adventure\",\"Sci-Fi\"]', 'Riichiro Inagaki (story), Boichi (art)', 'TMS Entertainment'),
('a7', 'Sword Art Online', 2012, '[\"Action\",\"Sci-Fi\"]', 'Reki Kawahara', 'A-1 Pictures'),
('a8', 'Bleach', 2004, '[\"Action\",\"Supernatural\"]', 'Tite Kubo', 'Pierrot');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `anime`
--
ALTER TABLE `anime`
  ADD PRIMARY KEY (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
