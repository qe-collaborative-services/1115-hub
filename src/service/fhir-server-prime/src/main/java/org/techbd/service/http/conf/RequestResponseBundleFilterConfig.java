package org.techbd.service.http.conf;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.techbd.service.http.filter.RequestResponseBundleFilter;

@Configuration
public class RequestResponseBundleFilterConfig {
    @Bean
    public FilterRegistrationBean<RequestResponseBundleFilter> requestResponsePojoFilterRegistration() {
        FilterRegistrationBean<RequestResponseBundleFilter> requestResponsePojoFilterBean = new FilterRegistrationBean<>();
        
        requestResponsePojoFilterBean.setFilter(new RequestResponseBundleFilter());
        requestResponsePojoFilterBean.addUrlPatterns("/Bundle/*"); // Set URL patterns to filter
        requestResponsePojoFilterBean.setOrder(2); // Set order of filter

        return requestResponsePojoFilterBean;
    }
}