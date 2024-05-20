package org.techbd.service.http.filter;

// Adapted from https://gist.github.com/michael-pratt/89eb8800be8ad47e79fe9edab8945c69

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jmx.export.annotation.ManagedOperation;
import org.springframework.jmx.export.annotation.ManagedResource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import javax.servlet.ServletException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

@ManagedResource
public class RequestResponseLog4jFilter extends OncePerRequestFilter {

   private final static Logger log = LoggerFactory.getLogger(RequestResponseLog4jFilter.class);

   private static final List<MediaType> VISIBLE_TYPES = Arrays.asList(
      MediaType.valueOf("text/*"),
      MediaType.APPLICATION_FORM_URLENCODED,
      MediaType.APPLICATION_JSON,
      MediaType.APPLICATION_XML,
      MediaType.valueOf("application/*+json"),
      MediaType.valueOf("application/*+xml"),
      MediaType.MULTIPART_FORM_DATA
   );

   /**
    * List of HTTP headers whose values should not be logged.
    */
   private static final List<String> SENSITIVE_HEADERS = Arrays.asList(
     "authorization",
      "proxy-authorization"
   );
   
   private boolean enabled = true;
   
   @ManagedOperation(description = "Enable logging of HTTP requests and responses")
   public void enable() {
      this.enabled = true;
   }

   @ManagedOperation(description = "Disable logging of HTTP requests and responses")
   public void disable() {
      this.enabled = false;
   }

   // @Override
   // protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
   //    if (isAsyncDispatch(request)) {
   //       filterChain.doFilter(request, response);
   //    } else {
   //       doFilterWrapped(wrapRequest(request), wrapResponse(response), filterChain);
   //    }
   // }

   protected void doFilterWrapped(ContentCachingRequestWrapper request, ContentCachingResponseWrapper response, jakarta.servlet.FilterChain filterChain) throws ServletException, IOException, jakarta.servlet.ServletException {

      StringBuilder msg = new StringBuilder();

      try {
         beforeRequest(request, response, msg);
         filterChain.doFilter(request, response);
      }
      finally {
         afterRequest(request, response, msg);
         if(log.isInfoEnabled()) {
            log.info(msg.toString());
         }
         response.copyBodyToResponse();
      }
   }

   protected void beforeRequest(ContentCachingRequestWrapper request, ContentCachingResponseWrapper response, StringBuilder msg) {
      if (enabled && log.isInfoEnabled()) {
         msg.append("\n-- [RequestResponseLog4jFilter] REQUEST --\n");
         logRequestHeader(request, request.getRemoteAddr() + "|>", msg);
      }
   }

   protected void afterRequest(ContentCachingRequestWrapper request, ContentCachingResponseWrapper response, StringBuilder msg) {
      if (enabled && log.isInfoEnabled()) {
         logRequestBody(request, request.getRemoteAddr() + "|>", msg);
         msg.append("\n-- [RequestResponseLog4jFilter] RESPONSE --\n");
         logResponse(response, request.getRemoteAddr() + "|<", msg);
      }
   }

   private static void logRequestHeader(ContentCachingRequestWrapper request, String prefix, StringBuilder msg) {
      String queryString = request.getQueryString();
      if (queryString == null) {
         msg.append(String.format("%s %s %s", prefix, request.getMethod(), request.getRequestURI())).append("\n");
      } else {
         msg.append(String.format("%s %s %s?%s", prefix, request.getMethod(), request.getRequestURI(), queryString)).append("\n");
      }
      Collections.list(request.getHeaderNames())
                 .forEach(headerName ->
                             Collections.list(request.getHeaders(headerName))
                                        .forEach(headerValue -> {
                                           if(isSensitiveHeader(headerName)) {
                                              msg.append(String.format("%s %s: %s", prefix, headerName, "*******")).append("\n");
                                           }
                                           else {
                                              msg.append(String.format("%s %s: %s", prefix, headerName, headerValue)).append("\n");
                                           }
                                        }));
      msg.append(prefix).append("\n");
   }

   private static void logRequestBody(ContentCachingRequestWrapper request, String prefix, StringBuilder msg) {
      byte[] content = request.getContentAsByteArray();
      if (content.length > 0) {
         logContent(content, request.getContentType(), request.getCharacterEncoding(), prefix, msg);
      }
   }

   private static void logResponse(ContentCachingResponseWrapper response, String prefix, StringBuilder msg) {
      int status = response.getStatus();
      msg.append(String.format("%s %s %s", prefix, status, HttpStatus.valueOf(status).getReasonPhrase())).append("\n");
      response.getHeaderNames()
              .forEach(headerName ->
                          response.getHeaders(headerName)
                                  .forEach(headerValue ->
                                  {
                                     if(isSensitiveHeader(headerName)) {
                                        msg.append(String.format("%s %s: %s", prefix, headerName, "*******")).append("\n");
                                     }
                                     else {
                                        msg.append(String.format("%s %s: %s", prefix, headerName, headerValue)).append("\n");
                                     }
                                  }));
      msg.append(prefix).append("\n");
      byte[] content = response.getContentAsByteArray();
      if (content.length > 0) {
         logContent(content, response.getContentType(), response.getCharacterEncoding(), prefix, msg);
      }
   }

   private static void logContent(byte[] content, String contentType, String contentEncoding, String prefix, StringBuilder msg) {
      MediaType mediaType = MediaType.valueOf(contentType);
      boolean visible = VISIBLE_TYPES.stream().anyMatch(visibleType -> visibleType.includes(mediaType));
      if (visible) {
         try {
            String contentString = new String(content, contentEncoding);
            Stream.of(contentString.split("\r\n|\r|\n")).forEach(line -> msg.append(prefix).append(" ").append(line).append("\n"));
         } catch (UnsupportedEncodingException e) {
            msg.append(String.format("%s [%d bytes content]", prefix, content.length)).append("\n");
         }
      } else {
         msg.append(String.format("%s [%d bytes content]", prefix, content.length)).append("\n");
      }
   }

   /**
    * Determine if a given header name should have its value logged.
    * @param headerName HTTP header name.
    * @return True if the header is sensitive (i.e. its value should <b>not</b> be logged).
    */
   private static boolean isSensitiveHeader(String headerName) {
      return SENSITIVE_HEADERS.contains(headerName.toLowerCase());
   }

   private static ContentCachingRequestWrapper wrapRequest(jakarta.servlet.http.HttpServletRequest request) {
      if (request instanceof ContentCachingRequestWrapper) {
         return (ContentCachingRequestWrapper) request;
      } else {
         return new ContentCachingRequestWrapper((jakarta.servlet.http.HttpServletRequest) request);
      }
   }

   private static ContentCachingResponseWrapper wrapResponse(jakarta.servlet.http.HttpServletResponse response) {
      if (response instanceof ContentCachingResponseWrapper) {
         return (ContentCachingResponseWrapper) response;
      } else {
         return new ContentCachingResponseWrapper((jakarta.servlet.http.HttpServletResponse) response);
      }
   }

   @Override
   protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request,
         jakarta.servlet.http.HttpServletResponse response, jakarta.servlet.FilterChain filterChain)
         throws jakarta.servlet.ServletException, IOException {
      // TODO Auto-generated method stub
      if (isAsyncDispatch(request)) {
         filterChain.doFilter(request, response);
      } else {
         try {
            doFilterWrapped(wrapRequest(request), wrapResponse(response), filterChain);
         } catch (ServletException | IOException e) {
            logger.error("Exception: ", e);
         }
      }
   }
}