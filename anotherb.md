# 📑 SkillSync: Complete Annotation Inventory

This document provides an exhaustive list of all functional annotations used across the **SkillSync** microservices ecosystem, categorized by their framework and purpose.

---

## 1️⃣ Spring Boot & Core (Inversion of Control)
- `@SpringBootApplication`: The primary bootstrap annotation for all services.
- `@Configuration`: Marks classes as sources of bean definitions.
- `@Component`: Generic stereotype for any Spring-managed component.
- `@Service`: Specialization of `@Component` for service-layer logic.
- `@Repository`: Specialization of `@Component` for data access.
- `@Autowired`: Enables automatic dependency injection.
- `@Value`: Injects values from properties or environment variables.
- `@Bean`: Declares a method-level bean to be managed by Spring.
- `@ComponentScan`: Configures package scanning for components.
- `@ConfigurationProperties`: Binds external properties to a class.
- `@PostConstruct`: Method to run after bean initialization.
- `@Order`: Defines the execution order of beans/filters.

---

## 2️⃣ Spring Web (REST API & Headers)
- `@RestController`: Combines `@Controller` and `@ResponseBody`.
- `@RequestMapping`: Maps HTTP request paths to controllers/methods.
- `@GetMapping`: Alias for `@RequestMapping(method = RequestMethod.GET)`.
- `@PostMapping`: Alias for `@RequestMapping(method = RequestMethod.POST)`.
- `@PutMapping`: Alias for `@RequestMapping(method = RequestMethod.PUT)`.
- `@DeleteMapping`: Alias for `@RequestMapping(method = RequestMethod.DELETE)`.
- `@PathVariable`: Extracts variables from the URL path.
- `@RequestParam`: Extracts values from query parameters.
- `@RequestBody`: Maps the HTTP request body to a Java object.
- `@RequestHeader`: Grabs specific headers from the incoming request.
- `@RestControllerAdvice`: Global interceptor for all `@RestController` classes.
- `@ExceptionHandler`: Defines methods to handle specific exceptions.

---

## 3️⃣ Spring Data JPA & Hibernate (Persistence)
- `@Entity`: Marks a POJO as a persistent database entity.
- `@Table`: Specifies the primary table for an entity.
- `@Id`: Designates the primary key of an entity.
- `@GeneratedValue`: Defines the generation strategy for primary keys.
- `@Column`: Customizes the mapping of a field to a database column.
- `@Enumerated`: Persists enum types as either String or Ordinal.
- `@OneToMany` / `@ManyToOne`: Defines relational mapping between entities.
- `@JoinColumn`: Specifies the foreign key column in a relationship.
- `@Transactional`: Wraps methods in a database transaction.
- `@Query`: Allows defining custom JPQL or native SQL queries.
- `@CreationTimestamp`: Automatically stores the creation date/time.
- `@UpdateTimestamp`: Automatically stores the last update date/time.
- `@PrePersist` / `@PreUpdate`: Hooks to run logic before DB operations.
- `@UniqueConstraint`: Defines unique constraints at the table level.
- `@Index`: Configures database indexes.

---

## 4️⃣ Spring Cloud (Distributed Systems)
- `@EnableDiscoveryClient`: Registers a service with the Eureka server.
- `@EnableEurekaServer`: Activates the Eureka Discovery Server logic.
- `@FeignClient`: Declarative REST client for inter-service calls.
- `@EnableFeignClients`: Scans for `@FeignClient` interfaces.

---

## 5️⃣ Spring Security
- `@EnableWebSecurity`: Enables Spring Security's web security support.
- `@PreAuthorize`: Method-level security expression (RBAC).

---

## 6️⃣ Resilience4j (Fault Tolerance)
- `@CircuitBreaker`: Implements the Circuit Breaker pattern for remote calls.
- `@Retry`: Automatically retries failed operations based on configuration.

---

## 7️⃣ Messaging (RabbitMQ)
- `@RabbitListener`: Marks a method as a listener for a specific queue.

---

## 8️⃣ Caching (Redis/In-Memory)
- `@EnableCaching`: Enables Spring's annotation-driven cache management.
- `@Cacheable`: Checks the cache before executing the method.
- `@CacheEvict`: Removes data from the cache (e.g., after update/delete).
- `@CacheConfig`: Provides shared cache settings at the class level.

---

## 9️⃣ Lombok (Boilerplate Removal)
- `@Data`: Generates Getters, Setters, ToString, EqualsAndHashCode.
- `@Getter` / `@Setter`: Generates specific accessors.
- `@NoArgsConstructor`: Generates a default constructor.
- `@AllArgsConstructor`: Generates a constructor for all fields.
- `@RequiredArgsConstructor`: Generates a constructor for final/NonNull fields.
- `@Builder`: Implements the Builder pattern for object creation.
- `@Slf4j`: Generates a Logback logger (SLF4J).

---

## 🔟 Validation (JSR-303 / Jakarta)
- `@Valid`: Enables recursive validation on the object.
- `@NotNull`: Ensures a field is not null.
- `@NotBlank`: Ensures a string is not null and not empty.
- `@Size`: Validates the length of a string or size of a collection.
- `@Email`: Ensures the string is a valid email format.
- `@Min` / `@Max`: Validates numeric ranges.
- `@DecimalMin` / `@DecimalMax`: Validates decimal values.
- `@Future`: Ensures a date is in the future.

---

## 1️⃣1️⃣ OpenAPI 3 / Swagger (Documentation)
- `@Tag`: Categorizes operations in the UI.
- `@Operation`: Describes a specific API operation.
- `@ApiResponses`: Container for multiple `@ApiResponse`.
- `@Parameter`: Describes a request parameter.
- `@SecurityRequirement`: Declares which security scheme is required.

---

## 1️⃣2️⃣ Testing (JUnit 5 & Mockito)
- `@Test`: Marks a method as a test case.
- `@BeforeEach`: Setup logic for each test.
- `@ExtendWith`: Registers an extension (e.g., MockitoExtension).
- `@Mock`: Creates a mock object.
- `@InjectMocks`: Injects mocks into the test subject.
- `@MockBean`: Replaces a Spring Bean with a mock in the context.
- `@SpringBootTest`: Loads the full application context for integration testing.
- `@WebMvcTest`: Slices the context for testing only the web layer.
- `@AutoConfigureMockMvc`: Configures `MockMvc` for controller testing.

---

## 1️⃣3️⃣ Spring AOP (Aspect Oriented Programming)
- `@Aspect`: Marks a class as an aspect for cross-cutting concerns.
- `@Pointcut`: Defines where an advice should be applied.
- `@Around`: Advice that surrounds a join point.
- `@AfterThrowing`: Advice that runs if a method throws an exception.

---

> [!IMPORTANT]
> This inventory reflects the current state of the SkillSync project. It includes core Java annotations (`@Override`) and framework-specific metadata used for automation.
