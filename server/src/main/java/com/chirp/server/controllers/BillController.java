package com.chirp.server.controllers;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v2/checkout")
public class BillController {

	@Value("${stripe.secret-key}")
	private String stripeSecretKey;

	@PostMapping("/create-checkout-session")
	public ResponseEntity<?> createCheckoutSession(@RequestParam("amount") long amount) {
		try {
			Stripe.apiKey = stripeSecretKey;

			SessionCreateParams params = SessionCreateParams.builder()
					.addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
					.addLineItem(
							SessionCreateParams.LineItem.builder()
									.setPriceData(
											SessionCreateParams.LineItem.PriceData.builder()
													.setCurrency("usd")
													.setProductData(
															SessionCreateParams.LineItem.PriceData.ProductData.builder()
																	.setName(amount == 700 ? "Premium Plan" : "Premium + Plan")
																	.build())
													.setUnitAmount(amount)
													.build())
									.setQuantity(1L)
									.build())
					.setMode(SessionCreateParams.Mode.PAYMENT)
					.setSuccessUrl("http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}")
					.setCancelUrl("http://localhost:5173/premium")
					.build();

			Session session = Session.create(params);

			Map<String, String> response = new HashMap<>();
			response.put("id" , session.getId());

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, String> errorResponse = new HashMap<>();
			errorResponse.put("error" , e.getMessage());
			return ResponseEntity.status(500).body(errorResponse);
		}
	}
}