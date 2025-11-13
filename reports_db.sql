-- MySQL Workbench Forward Engineering
DROP DATABASE reports_db;
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema reports_db
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema reports_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `reports_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `reports_db` ;

-- -----------------------------------------------------
-- Table `reports_db`.`staff_info`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports_db`.`staff_info` (
  `staff_id` INT NOT NULL AUTO_INCREMENT,
  `staff_type` VARCHAR(45) NULL DEFAULT NULL,
  `email` VARCHAR(45) NULL DEFAULT NULL,
  `password` VARCHAR(60) NULL DEFAULT NULL,
  PRIMARY KEY (`staff_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `reports_db`.`admins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports_db`.`admins` (
  `admin_id` INT NOT NULL AUTO_INCREMENT,
--   `spu_id` INT NULL DEFAULT NULL, -- just use the `spus_has_admins`
  `staff_info_id` INT NOT NULL,
  `first_name` VARCHAR(45) NULL DEFAULT NULL,
  `middle_name` VARCHAR(45) NULL DEFAULT NULL,
  `last_name` VARCHAR(45) NULL DEFAULT NULL,
  `email` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`admin_id`),
  INDEX `fk_admins_staff_info1_idx` (`staff_info_id` ASC) VISIBLE,
  CONSTRAINT `fk_admins_staff_info1`
    FOREIGN KEY (`staff_info_id`)
    REFERENCES `reports_db`.`staff_info` (`staff_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `reports_db`.`spus`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports_db`.`spus` (
  `spu_id` INT NOT NULL AUTO_INCREMENT,
--   `supervisor_id` INT NULL DEFAULT NULL, -- already referenced by `supervisors`
  `spu_name` VARCHAR(150) NULL DEFAULT NULL,
  PRIMARY KEY (`spu_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `reports_db`.`supervisors`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports_db`.`supervisors` (
  `supervisor_id` INT NOT NULL AUTO_INCREMENT,
  `spu_id` INT NOT NULL,
  `staff_info_id` INT NOT NULL,
  `first_name` VARCHAR(45) NULL DEFAULT NULL,
  `middle_name` VARCHAR(45) NULL DEFAULT NULL,
  `last_name` VARCHAR(45) NULL DEFAULT NULL,
  `email` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`supervisor_id`),
  INDEX `fk_supervisors_spus1_idx` (`spu_id` ASC) VISIBLE,
  INDEX `fk_supervisors_staff_info1_idx` (`staff_info_id` ASC) VISIBLE,
  CONSTRAINT `fk_supervisors_spus1`
    FOREIGN KEY (`spu_id`)
    REFERENCES `reports_db`.`spus` (`spu_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_supervisors_staff_info1`
    FOREIGN KEY (`staff_info_id`)
    REFERENCES `reports_db`.`staff_info` (`staff_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `reports_db`.`sdws`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports_db`.`sdws` (
  `sdw_id` INT NOT NULL AUTO_INCREMENT,
  `spu_id` INT NOT NULL,
  `supervisor_id` INT NOT NULL,
  `staff_info_id` INT NOT NULL,
  `first_name` VARCHAR(45) NULL DEFAULT NULL,
  `middle_name` VARCHAR(45) NULL DEFAULT NULL,
  `last_name` VARCHAR(45) NULL DEFAULT NULL,
  `email` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`sdw_id`),
  INDEX `fk_sdws_supervisors1_idx` (`supervisor_id` ASC) VISIBLE,
  INDEX `fk_sdws_staff_info1_idx` (`staff_info_id` ASC) VISIBLE,
  CONSTRAINT `fk_sdws_spus1`
    FOREIGN KEY (`spu_id`)
    REFERENCES `reports_db`.`spus` (`spu_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sdws_supervisors1`
    FOREIGN KEY (`supervisor_id`)
    REFERENCES `reports_db`.`supervisors` (`supervisor_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sdws_staff_info1`
    FOREIGN KEY (`staff_info_id`)
    REFERENCES `reports_db`.`staff_info` (`staff_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `reports_db`.`reports`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports_db`.`reports` (
  `report_id` INT NOT NULL AUTO_INCREMENT,
  `sdw_id` INT NOT NULL,
  -- `spu_id` INT NOT NULL,
  `report_name` VARCHAR(60) NOT NULL,
  `file_size` INT NOT NULL,
  `upload_date` DATETIME NOT NULL,
  `type` ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12') NOT NULL,
  `file_path` VARCHAR(150) NULL DEFAULT NULL,
  `snapshot_path` VARCHAR(150) NULL DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  INDEX `fk_reports_sdws1_idx` (`sdw_id` ASC) VISIBLE,
  CONSTRAINT `fk_reports_sdws1`
    FOREIGN KEY (`sdw_id`)
    REFERENCES `reports_db`.`sdws` (`sdw_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `reports_db`.`spus_has_admins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports_db`.`spus_has_admins` (
  `admins_admin_id` INT NOT NULL,
  `spus_spu_id` INT NOT NULL,
  INDEX `fk_spus_has_admins_admins1_idx` (`admins_admin_id` ASC) VISIBLE,
  INDEX `fk_spus_has_admins_spus1_idx` (`spus_spu_id` ASC) VISIBLE,
  CONSTRAINT `fk_spus_has_admins_admins1`
    FOREIGN KEY (`admins_admin_id`)
    REFERENCES `reports_db`.`admins` (`admin_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_spus_has_admins_spus1`
    FOREIGN KEY (`spus_spu_id`)
    REFERENCES `reports_db`.`spus` (`spu_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
