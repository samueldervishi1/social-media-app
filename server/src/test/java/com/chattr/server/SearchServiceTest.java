package com.chattr.server;

import com.chattr.server.models.Community;
import com.chattr.server.models.User;
import com.chattr.server.repositories.SearchRepository;
import com.chattr.server.repositories.SearchUserRepository;
import com.chattr.server.services.SearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class SearchServiceTest {

    private SearchRepository searchRepository;
    private SearchUserRepository searchUserRepository;
    private SearchService searchService;

    @BeforeEach
    void setup() {
        searchRepository = mock(SearchRepository.class);
        searchUserRepository = mock(SearchUserRepository.class);
        searchService = new SearchService(searchRepository, searchUserRepository);
    }

    @Test
    void searchCommunitiesByName_shouldReturnMatchingCommunities() {
        Community c1 = new Community("java", "owner123", "Java devs unite!");
        when(searchRepository.findByName("java")).thenReturn(List.of(c1));

        List<Community> result = searchService.searchCommunitiesByName("java");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("java");
    }

    @Test
    void searchUsers_shouldReturnFilteredUsersMatchingCondenseName() {
        User u1 = new User();
        u1.setUsername("sam");
        u1.setFullName("Samuel Dervishi");

        User u2 = new User();
        u2.setUsername("irrelevant");
        u2.setFullName("Something Else");

        when(searchUserRepository.findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase("sam", "sam"))
                .thenReturn(List.of(u1, u2));

        List<User> result = searchService.searchUsers("sam");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFullName()).contains("Samuel");
    }

}