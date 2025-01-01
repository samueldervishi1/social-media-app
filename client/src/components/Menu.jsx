import React from "react";
import { LiaUserFriendsSolid } from "react-icons/lia";
import { CiSaveDown2 } from "react-icons/ci";
import { RiUserCommunityLine } from "react-icons/ri";
import { SiEventstore } from "react-icons/si";
import { TbLogs } from "react-icons/tb";
import styles from "../styles/menu.module.css";

const Menu = () => {
  return (
    <nav className={styles.menu_container}>
      <ul className={styles.menu_list}>
        <li>
          <LiaUserFriendsSolid className={styles.icons} />{" "}
          <a href="/user/friends">Friends</a>
        </li>
        <li>
          <CiSaveDown2 className={styles.icons} />{" "}
          <a href="/user/saved">Saved</a>
        </li>
        <li>
          <RiUserCommunityLine className={styles.icons} />{" "}
          <a href="/c/user/communities">Your Communities</a>
        </li>
        <li>
          <SiEventstore className={styles.icons} />
          <a href="/c/events"> Events</a>
        </li>
        <li>
          <TbLogs className={styles.icons} />
          <a href="/user/activity"> Activity</a>
        </li>
      </ul>
      <div className={styles.footer_links}>
        <a href="/about">About</a> ·<a href="/terms">Terms</a> ·
        <a href="/contact">Contact</a> ·<a href="/help">Help</a>
        <a href="/health">Health</a> ·<a href="/home">CHYRA © 2024</a>
      </div>
    </nav>
  );
};

export default Menu;