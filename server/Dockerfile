# ----------- Build Stage -------------
FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app

COPY . .
RUN chmod +x mvnw && ./mvnw clean install -DskipTests

# ----------- Run Stage --------------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 5100

ENTRYPOINT ["java", "-jar", "app.jar"]