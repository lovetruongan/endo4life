package com.endo4life.utils;

import lombok.experimental.UtilityClass;
import com.endo4life.constant.Constants;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@UtilityClass
public class StringUtil {
    public static String removeEmailSuffix(String email) {
        return email.substring(0, email.indexOf("@"));
    }

    public static String toContainParam(final String param) {
        return StringUtils.join(
                "%",
                StringUtils.lowerCase(StringUtils.defaultString(param)),
                "%");
    }

    public static String toLikeParam(final String param) {
        return StringUtils.join(
                StringUtils.lowerCase(StringUtils.defaultString(param)),
                "%");
    }

    public static String convertListToString(List<String> list) {
        if (CollectionUtils.isEmpty(list)) {
            return null;
        }
        return String.join(",", list);
    }

    public static List<String> convertStringToList(String anyString) {
        if (StringUtils.isBlank(anyString)) {
            return new ArrayList<>();
        }
        return Arrays.stream(anyString.split(",")).toList();
    }
}
