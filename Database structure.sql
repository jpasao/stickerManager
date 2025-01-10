-- MariaDB dump 10.19  Distrib 10.11.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: dbstickers
-- ------------------------------------------------------
-- Server version	10.11.6-MariaDB-0+deb12u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `IdCategory` int(11) NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(200) NOT NULL,
  PRIMARY KEY (`IdCategory`),
  UNIQUE KEY `categories_unique` (`CategoryName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `images` (
  `IdImage` int(11) NOT NULL AUTO_INCREMENT,
  `IdSticker` int(11) NOT NULL,
  `StickerImage` mediumblob NOT NULL,
  `StickerThumbnail` blob NOT NULL DEFAULT 0,
  PRIMARY KEY (`IdImage`),
  KEY `images_stickers_FK` (`IdSticker`),
  CONSTRAINT `images_stickers_FK` FOREIGN KEY (`IdSticker`) REFERENCES `stickers` (`IdSticker`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stickercategories`
--

DROP TABLE IF EXISTS `stickercategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stickercategories` (
  `IdSticker` int(11) NOT NULL,
  `IdCategory` int(11) NOT NULL,
  PRIMARY KEY (`IdSticker`,`IdCategory`),
  KEY `stickercategories_categories_FK` (`IdCategory`),
  CONSTRAINT `stickercategories_categories_FK` FOREIGN KEY (`IdCategory`) REFERENCES `categories` (`IdCategory`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stickercategories_stickers_FK` FOREIGN KEY (`IdSticker`) REFERENCES `stickers` (`IdSticker`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stickers`
--

DROP TABLE IF EXISTS `stickers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stickers` (
  `IdSticker` int(11) NOT NULL AUTO_INCREMENT,
  `StickerName` varchar(200) NOT NULL,
  `Created` date DEFAULT current_timestamp(),
  PRIMARY KEY (`IdSticker`),
  UNIQUE KEY `stickers_unique` (`StickerName`),
  KEY `stickers_StickerName_index` (`StickerName`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stickertags`
--

DROP TABLE IF EXISTS `stickertags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stickertags` (
  `IdSticker` int(11) NOT NULL,
  `IdTag` int(11) NOT NULL,
  PRIMARY KEY (`IdTag`,`IdSticker`),
  KEY `stickertags_tags_FK` (`IdTag`),
  KEY `stickertags_stickers_FK` (`IdSticker`),
  CONSTRAINT `stickertags_stickers_FK` FOREIGN KEY (`IdSticker`) REFERENCES `stickers` (`IdSticker`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stickertags_tags_FK` FOREIGN KEY (`IdTag`) REFERENCES `tags` (`IdTag`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags` (
  `IdTag` int(11) NOT NULL AUTO_INCREMENT,
  `TagName` varchar(200) NOT NULL,
  PRIMARY KEY (`IdTag`),
  UNIQUE KEY `tags_unique` (`TagName`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-10 13:03:19