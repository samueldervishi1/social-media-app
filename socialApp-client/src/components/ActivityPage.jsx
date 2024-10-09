// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { format, parseISO } from "date-fns";
// import loaderImage from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/assets/ZKZg.gif";
// import "../styles/activity.css";

// const ActivityPage = () => {
//   const [activities, setActivities] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const [error, setError] = useState(null);
//   const [networkError, setNetworkError] = useState(null);
//   const [comments, setComments] = useState({});
//   const [posts, setPosts] = useState({});
//   const [usernames, setUsernames] = useState({});
//   const [isLoading, setIsLoading] = useState();

//   const navigate = useNavigate();

//   const apiUrl = import.meta.env.VITE_API_BASE_URL;

//   useEffect(() => {
//     const isAuthenticated = () => {
//       const token = localStorage.getItem("token");
//       if (token) {
//         try {
//           const decodedToken = JSON.parse(atob(token.split(".")[1]));
//           const expirationTime = decodedToken.exp * 1000;
//           return Date.now() < expirationTime;
//         } catch (error) {
//           console.error("Error decoding token: ", error.message);
//           return false;
//         }
//       } else {
//         return false;
//       }
//     };

//     if (!isAuthenticated()) {
//       navigate("/login");
//     } else {
//       const fetchActivities = async () => {
//         setIsLoading(true);
//         try {
//           const token = localStorage.getItem("token");
//           const decodedToken = JSON.parse(atob(token.split(".")[1]));
//           const loggedInUserId = decodedToken.userId;
//           setUserId(loggedInUserId);

//           console.log(`Fetching all activities`);
//           const response = await fetch(
//             `http://localhost:5000/api/v1/activity/all`,
//             {
//               cache: "no-cache",
//             }
//           );

//           if (!response.ok) {
//             if (response.status === 408) {
//               throw new Error("Rate limit exceeded. Please try again later.");
//             } else {
//               throw new Error(`HTTP error! status: ${response.status}`);
//             }
//           }

//           const userIds = new Set();
//           const data = await response.json();
//           setActivities(data);
//           console.log("Fetched activities:", data);

//           const usernamesMap = {};
//           for (const activity of data) {
//             userIds.add(activity.userId);
//             const activityMessages = activity.actionType.allActivity;
//             for (const message of activityMessages) {
//               const commentMatch = message.match(
//                 /created comment with id (\S+)(?: on post with id (\S+))?/
//               );
//               const postMatch = message.match(/created post with id (\S+)/);
//               const likedPostMatch = message.match(/liked post with id (\S+)/);
//               const savedPostMatch = message.match(/saved post with id (\S+)/);
//               const likedCommentMatch = message.match(
//                 /liked comment with id (\S+)/
//               );

//               if (commentMatch) {
//                 const postId = commentMatch[2];
//                 const commentId = commentMatch[1];
//                 userIds.add(activity.userId);

//                 const commentResponse = await fetch(
//                   `http://localhost:5000/api/v1/posts/comments/get/${postId}/${commentId}`,
//                   {
//                     cache: "no-cache",
//                   }
//                 );

//                 if (!commentResponse.ok) {
//                   throw new Error(
//                     `Error fetching comment: ${commentResponse.status}`
//                   );
//                 }

//                 const commentData = await commentResponse.json();
//                 setComments((prevComments) => ({
//                   ...prevComments,
//                   [commentId]: commentData,
//                 }));
//               }

//               if (postMatch) {
//                 const postId = postMatch[1];
//                 userIds.add(activity.userId);
//                 const postResponse = await fetch(
//                   `http://localhost:5000/api/v1/posts/${postId}`,
//                   {
//                     cache: "no-cache",
//                   }
//                 );

//                 if (!postResponse.ok) {
//                   throw new Error(
//                     `Error fetching post: ${postResponse.status}`
//                   );
//                 }

//                 const postData = await postResponse.json();
//                 setPosts((prevPosts) => ({
//                   ...prevPosts,
//                   [postId]: postData,
//                 }));
//               }
//             }
//           }
//           const usernameRequests = Array.from(userIds).map(async (id) => {
//             const userResponse = await fetch(
//               `http://localhost:5000/api/v1/users/${id}`
//             );
//             if (!userResponse.ok) {
//               throw new Error(`Error fetching user: ${userResponse.status}`);
//             }
//             const userData = await userResponse.json();
//             return { id: userData.id, username: userData.username };
//           });

//           const usernameResults = await Promise.all(usernameRequests);
//           const usernamesMap1 = usernameResults.reduce((map, user) => {
//             map[user.id] = user.username;
//             return map;
//           }, {});

//           setUsernames(usernamesMap1);
//         } catch (error) {
//           console.error("Error fetching activities: ", error);
//           if (error.message === "Failed to fetch") {
//             setNetworkError("Network error. Please check your connection.");
//           } else {
//             setError(error.message);
//           }
//         } finally {
//           setTimeout(() => setIsLoading(false), 2000);
//         }
//       };

//       fetchActivities();
//     }
//   }, [navigate, apiUrl]);

//   const renderActivity = (activity, index) => {
//     const { actionType, userId: activityUserId, timestamp } = activity;
//     const formattedTimestamp = format(
//       new Date(timestamp * 1000),
//       "dd/MMM/yyyy - hh:mm a"
//     );
//     const activityMessages = actionType.allActivity.map((message, index) => {
//       const commentMatch = message.match(
//         /created comment with id (\S+)(?: on post with id (\S+))?/
//       );
//       const postMatch = message.match(/created post with id (\S+)/);
//       const likedPostMatch = message.match(/liked post with id (\S+)/);
//       const savedPostMatch = message.match(/saved post with id (\S+)/);
//       const likedCommentMatch = message.match(/liked comment with id (\S+)/);

//       let messageContent;

//       if (commentMatch) {
//         const commentId = commentMatch[1];
//         const postId = commentMatch[2];
//         const isCurrentUser = userId === activityUserId;

//         const comment = comments[commentId];
//         const commentDateTime = comment
//           ? format(
//               parseISO(
//                 `${comment.commentDate} ${comment.commentTime}`,
//                 "yyyy-MM-dd HH:mm:ss",
//                 new Date()
//               ),
//               "dd/MMM/yyyy - hh:mm a"
//             )
//           : null;

//         const commentContent = comment ? (
//           <div className="comment-card">
//             <p>{comment.content}</p>
//             <a
//               href={`/posts/${postId}#comment-${commentId}`}
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               View Comment
//             </a>
//           </div>
//         ) : null;

//         messageContent = (
//           <div key={index} className="activity-item">
//             <div className="activity-item-content">
//               <span className="activity-span">
//                 {userId === activityUserId
//                   ? "You"
//                   : usernames[activityUserId] || activityUserId}{" "}
//                 commented
//               </span>
//               <span className="line-point"> — </span>
//               <span className="timestamp">{commentDateTime}</span>
//               {commentContent}
//             </div>
//           </div>
//         );
//       } else if (postMatch) {
//         const postId = postMatch[1];
//         const post = posts[postId];
//         const postLink = `/posts/${postId}`;

//         const postDateTime = post
//           ? format(
//               parseISO(
//                 `${post.postDate} ${post.postTime}`,
//                 "yyyy-MM-dd HH:mm:ss",
//                 new Date()
//               ),
//               "dd/MMM/yyyy - hh:mm a"
//             )
//           : null;

//         const postContent = post ? (
//           <div className="post-card1">
//             <p>{post.content}</p>
//             <a
//               className="comment-card"
//               href={postLink}
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               View Post
//             </a>
//           </div>
//         ) : null;

//         messageContent = (
//           <div key={index} className="activity-item">
//             <div className="activity-item-content">
//               {" "}
//               <span className="activity-span">
//                 {userId === activityUserId
//                   ? "You"
//                   : usernames[activityUserId] || activityUserId}{" "}
//                 created a post
//               </span>
//               <span className="line-point"> — </span>
//               <span className="timestamp">{postDateTime}</span>
//               {postContent}
//             </div>
//           </div>
//         );
//       } else if (likedPostMatch) {
//         const postId = likedPostMatch[1];
//         const postLink = `/posts/${postId}`;

//         messageContent = (
//           <div key={index} className="activity-item">
//             <div className="activity-item-content">
//               <span className="activity-span">
//                 {userId === activityUserId
//                   ? "You"
//                   : usernames[activityUserId] || activityUserId}{" "}
//                 liked a post
//               </span>
//               <span className="line-point"> — </span>
//               <a
//                 className="comment-card view-post"
//                 href={postLink}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 View Post
//               </a>
//             </div>
//           </div>
//         );
//       } else if (savedPostMatch) {
//         const postId = savedPostMatch[1];
//         const postLink = `/posts/${postId}`;

//         messageContent = (
//           <div key={index} className="activity-item">
//             <div className="activity-item-content">
//               <span className="activity-span">
//                 {userId === activityUserId
//                   ? "You"
//                   : usernames[activityUserId] || activityUserId}{" "}
//                 saved a post
//               </span>
//               <span className="line-point"> — </span>
//               <a
//                 className="comment-card view-post"
//                 href={postLink}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 View Post
//               </a>
//             </div>
//           </div>
//         );
//       } else if (likedCommentMatch) {
//         const commentId = likedCommentMatch[1];
//         const comment = comments[commentId];
//         const commentDateTime = comment
//           ? format(
//               parseISO(
//                 `${comment.commentDate} ${comment.commentTime}`,
//                 "yyyy-MM-dd HH:mm:ss",
//                 new Date()
//               ),
//               "dd/MMM/yyyy - hh:mm a"
//             )
//           : null;

//         const commentContent = comment ? (
//           <div className="comment-card">
//             <p>{comment.content}</p>
//             <span className="timestamp">{commentDateTime}</span>
//           </div>
//         ) : null;

//         messageContent = (
//           <div key={index} className="activity-item">
//             <div className="activity-item-content">
//               <span className="activity-span">
//                 {userId === activityUserId
//                   ? "You"
//                   : usernames[activityUserId] || activityUserId}{" "}
//                 liked a comment
//               </span>
//               {commentContent}
//             </div>
//           </div>
//         );
//       }

//       return messageContent;
//     });

//     return <div key={activity.id}>{activityMessages}</div>;
//   };

//   const handleBackHome = () => {
//     navigate("/home");
//   };

//   return (
//     <div className="activity-page-container" style={{ textAlign: "center" }}>
//       <div className="h1-ac-button">
//         {/* <button className="backB" onClick={handleBackHome}>
//           <IoIosArrowRoundBack className="back-icon" />
//         </button> */}
//         <h1 className="ac-pg">Activity Page</h1>
//       </div>
//       {isLoading ? (
//         <div className="loading-container">
//           <img src={loaderImage} alt="Loading..." style={{ width: 30 }} />
//         </div>
//       ) : networkError ? (
//         <p>{networkError}</p>
//       ) : error ? (
//         <p>Error: {error}</p>
//       ) : activities.length ? (
//         activities.map(renderActivity)
//       ) : (
//         <p>No activities found.</p>
//       )}
//     </div>
//   );
// };

// export default ActivityPage;
