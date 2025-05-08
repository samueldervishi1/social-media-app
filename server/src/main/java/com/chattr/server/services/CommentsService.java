package com.chattr.server.services;

import com.chattr.server.exceptions.CustomException;
import com.chattr.server.models.Codes;
import com.chattr.server.models.Comments;
import com.chattr.server.models.Post;
import com.chattr.server.models.User;
import com.chattr.server.repositories.PostRepository;
import com.chattr.server.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CommentsService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public CommentsService(UserRepository userRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    @Transactional
    public Comments createComment(String userId, String postId, Comments comment) {
        try {
            User user = getUserById(userId);
            Post post = getPostById(postId);

            comment.setUserId(user.getId());
            List<Comments> comments = post.getCommentsList();
            comments.add(comment);
            post.setCommentsList(comments);

            postRepository.save(post);
            return comment;
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(500, Codes.ERROR_500);
        }
    }

    @Transactional
    public void deleteComment(String postId, String commentId) {
        try {
            Post post = getPostById(postId);
            Comments comment = getCommentFromPost(post, commentId).orElseThrow(() ->
                    new CustomException(404, "Comment not found: " + commentId));

            List<Comments> comments = post.getCommentsList();
            comments.remove(comment);
            post.setCommentsList(comments);

            postRepository.save(post);
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(500, Codes.ERROR_500);
        }
    }

    public Optional<Comments> getCommentById(String postId, String commentId) {
        try {
            Post post = getPostById(postId);
            return getCommentFromPost(post, commentId);
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(500, Codes.ERROR_500);
        }
    }

    private User getUserById(String userId) {
        return userRepository.findById(userId).orElseThrow(() -> new CustomException(404, String.format(Codes.USER_NOT_FOUND_BY_ID, userId)));
    }

    private Post getPostById(String postId) {
        return postRepository.findById(postId).orElseThrow(() -> new CustomException(404, String.format(Codes.POST_NOT_FOUND, postId)));
    }

    private Optional<Comments> getCommentFromPost(Post post, String commentId) {
        return post.getCommentsList().stream()
                .filter(comment -> comment.getId().equals(commentId))
                .findFirst()
                .map(Optional::of)
                .orElseThrow(() -> new CustomException(404, String.format(Codes.COMMENT_NOT_FOUND, commentId)));
    }
}