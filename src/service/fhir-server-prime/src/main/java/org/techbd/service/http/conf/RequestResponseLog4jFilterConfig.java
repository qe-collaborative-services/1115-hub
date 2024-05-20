package org.techbd.service.http.conf;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.techbd.service.http.filter.RequestResponseLog4jFilter;

@Configuration
public class RequestResponseLog4jFilterConfig {
    @Bean
    public FilterRegistrationBean<RequestResponseLog4jFilter> requestResponseLog4jFilterRegistration() {
        FilterRegistrationBean<RequestResponseLog4jFilter> requestResponseLog4jBean = new FilterRegistrationBean<>();
        
        requestResponseLog4jBean.setFilter(new RequestResponseLog4jFilter());
        requestResponseLog4jBean.addUrlPatterns("/*"); // Set URL patterns to filter
        requestResponseLog4jBean.setOrder(1); // Set order of filter

        return requestResponseLog4jBean;
    }
}