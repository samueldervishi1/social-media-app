package com.chirp.server.controllers;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ErrorControllerClass implements ErrorController {

	@GetMapping("/error")
	public String handleError(HttpServletRequest request , Model model) {
		Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
		if (status != null) {
			int statusCode = Integer.parseInt(status.toString());
			model.addAttribute("statusCode" , statusCode);
		}
		return "error";
	}
}