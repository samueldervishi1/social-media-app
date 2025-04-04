# ----------- Build Stage -------------
FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app

# Copy all files and build with Maven
COPY . .
RUN ./mvnw clean install -DskipTests

# ----------- Run Stage --------------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Optional: expose the app port (Spring Boot default)
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]