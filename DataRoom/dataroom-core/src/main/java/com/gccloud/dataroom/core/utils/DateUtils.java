package com.gccloud.dataroom.core.utils;

import org.apache.commons.lang3.time.DateFormatUtils;

import java.lang.management.ManagementFactory;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 时间工具类
 *
 * @author Acechengui
 */
public class DateUtils extends org.apache.commons.lang3.time.DateUtils
{
    public static String YYYY = "yyyy";

    public static String YYYY_MM = "yyyy-MM";

    public static String YYYY_MM_DD = "yyyy-MM-dd";

    public static String YYYYMMDDHHMMSS = "yyyyMMddHHmmss";

    public static String HHMMSS = "HHmmss";

    public static String YYYY_MM_DD_HH_MM_SS = "yyyy-MM-dd HH:mm:ss";

    private static String[] parsePatterns = {
            "yyyy-MM-dd", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm", "yyyy-MM",
            "yyyy/MM/dd", "yyyy/MM/dd HH:mm:ss", "yyyy/MM/dd HH:mm", "yyyy/MM",
            "yyyy.MM.dd", "yyyy.MM.dd HH:mm:ss", "yyyy.MM.dd HH:mm", "yyyy.MM"};

    /**
     * 获取当前Date型日期
     *
     * @return Date() 当前日期
     */
    public static Date getNowDate()
    {
        return new Date();
    }

    /**
     * 获取昨天日期（年月日）, 默认格式为yyyy-MM-dd
     *
     * @return String
     */
    public static String getyesterday(){
        Calendar cal =  Calendar.getInstance();
        cal.add(Calendar.DATE,   -1);
        return new SimpleDateFormat( "yyyy-MM-dd ").format(cal.getTime());
    }

    /**
     * 获取当前日期, 默认格式为yyyy-MM-dd
     *
     * @return String
     */
    public static String getDate()
    {
        return dateTimeNow(YYYY_MM_DD);
    }

    public static final String getTime()
    {
        return dateTimeNow(YYYY_MM_DD_HH_MM_SS);
    }

    public static final String dateTimeNow()
    {
        return dateTimeNow(YYYYMMDDHHMMSS);
    }

    public static final String getTimeNow() {
        return dateTimeNow(HHMMSS);
    }

    public static final String dateTimeNow(final String format)
    {
        return parseDateToStr(format, new Date());
    }

    public static final String dateTime(final Date date)
    {
        return parseDateToStr(YYYY_MM_DD, date);
    }

    public static final String parseDateToStr(final String format, final Date date)
    {
        return new SimpleDateFormat(format).format(date);
    }

    public static final Date dateTime(final String format, final String ts)
    {
        try
        {
            return new SimpleDateFormat(format).parse(ts);
        }
        catch (ParseException e)
        {
            throw new RuntimeException(e);
        }
    }

    /**
     * 日期路径 即年/月/日 如2018/08/08
     */
    public static final String datePath()
    {
        Date now = new Date();
        return DateFormatUtils.format(now, "yyyy/MM/dd");
    }

    /**
     * 日期路径 即年/月/日 如20180808
     */
    public static final String dateTime()
    {
        Date now = new Date();
        return DateFormatUtils.format(now, "yyyyMMdd");
    }

    /**
     * 日期型字符串转化为日期 格式
     */
    public static Date parseDate(Object str)
    {
        if (str == null)
        {
            return null;
        }
        try
        {
            return parseDate(str.toString(), parsePatterns);
        }
        catch (ParseException e)
        {
            return null;
        }
    }

    /**
     * 获取服务器启动时间
     */
    public static Date getServerStartDate()
    {
        long time = ManagementFactory.getRuntimeMXBean().getStartTime();
        return new Date(time);
    }

    /**
     * 计算两个时间差
     */
    public static String getDatePoor(Date endDate, Date nowDate)
    {
        long nd = 1000 * 24 * 60 * 60;
        long nh = 1000 * 60 * 60;
        long nm = 1000 * 60;
        // long ns = 1000;
        // 获得两个时间的毫秒时间差异
        long diff = endDate.getTime() - nowDate.getTime();
        // 计算差多少天
        long day = diff / nd;
        // 计算差多少小时
        long hour = diff % nd / nh;
        // 计算差多少分钟
        long min = diff % nd % nh / nm;
        // 计算差多少秒//输出结果
        // long sec = diff % nd % nh % nm / ns;
        return day + "天" + hour + "小时" + min + "分钟";
    }
    /**
     * 计算两个天数差
     */
    public static long getDaysDifference(Date endDate, Date nowDate)
    {
        long nd = 1000 * 24 * 60 * 60;
        long nh = 1000 * 60 * 60;
        long nm = 1000 * 60;
        // 获得两个时间的毫秒时间差异
        long diff = endDate.getTime() - nowDate.getTime();
        // 计算差多少天
        return diff / nd;
    }

    /**
     * 增加 LocalDateTime ==> Date
     */
    public static Date toDate(LocalDateTime temporalAccessor)
    {
        ZonedDateTime zdt = temporalAccessor.atZone(ZoneId.systemDefault());
        return Date.from(zdt.toInstant());
    }

    /**
     * 增加 LocalDate ==> Date
     */
    public static Date toDate(LocalDate temporalAccessor)
    {
        LocalDateTime localDateTime = LocalDateTime.of(temporalAccessor, LocalTime.of(0, 0, 0));
        ZonedDateTime zdt = localDateTime.atZone(ZoneId.systemDefault());
        return Date.from(zdt.toInstant());
    }

    /**
     * 判断日期是否为1号
     */
    public static boolean isFirstDayOfMonth(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.set(Calendar.DATE, calendar.get(Calendar.DATE) + 1);
        return calendar.get(Calendar.DAY_OF_MONTH) == 2;
    }

    /**
     * 判断日期是否为月末
     */
    public static boolean isLastDayOfMonth(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.set(Calendar.DATE, calendar.get(Calendar.DATE) + 1);
        return calendar.get(Calendar.DAY_OF_MONTH) == 1;
    }

    /**
     * 判断当前时间是否在某个时间之前
     *
     * @param tagDateTime 判断的标准
     * @return true是，false不是
     */
    public static boolean isTodayBefore(Date tagDateTime) {
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        Calendar contCalendar = Calendar.getInstance();
        Calendar tagCalendar = (Calendar) contCalendar.clone();
        tagCalendar.setTime(tagDateTime);
        return contCalendar.before(tagCalendar);
    }

    //判断选择的日期是否是今天
    public static boolean isToday(Date time) {
        return isThisTime(time, "yyyy-MM-dd");
    }

    private static boolean isThisTime(Date time, String pattern) {
        SimpleDateFormat sdf = new SimpleDateFormat(pattern);
        //参数时间
        String param = sdf.format(time);
        //当前时间
        String now = sdf.format(new Date());
        return param.equals(now);
    }

    /**
     * 返回当前时间的单个时间类型
     *
     * @param type 1：年；2：月；3：日；
     * @return int
     */
    public static int singleDate(int type) {
        Calendar calendar = Calendar.getInstance();
        return switch (type) {
            case 1 -> calendar.get(Calendar.YEAR);
            case 2 -> calendar.get(Calendar.MONTH) + 1;
            case 3 -> calendar.get(Calendar.DATE);
            default -> 0;
        };
    }

    /**
     * 获取上个月天数
     * @return 天数
     */
    public static int getDaysOfLastMonth() {
        //取得系统当前时间
        Calendar cal = Calendar.getInstance();
        //取得系统当前时间所在月第一天时间对象
        cal.set(Calendar.DAY_OF_MONTH, 1);
        //日期减一,取得上月最后一天时间对象
        cal.add(Calendar.DAY_OF_MONTH, -1);
        //输出上月最后一天日期
        return cal.get(Calendar.DAY_OF_MONTH);
    }


    /**
     * 获取月份的起始天/最后一天
     *
     * @param direction 方向 （1：上个月；2：本月；3：下个月；）
     * @param startEnd 始/末  （1：月份第一天；2：月份最后一天）
     * @return 返回 yyyy-MM-dd 格式的日期
     */
    public static String getFirstDayMonth(int direction, int startEnd) throws ParseException {
        Calendar calendar = Calendar.getInstance();
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH) + 1;

        month = direction == 1 ? (month - 1) : direction == 3 ? (month + 1) : month;
        StringBuilder sb = new StringBuilder();
        if (month < 1) {
            sb.append(year - 1).append("-12");
        } else if (month > 12) {
            sb.append(year + 1).append("-01");
        } else {
            sb.append(year).append("-").append(month < 10 ? "0" + month : month);
        }

        sb.append("-01");
        if (startEnd == 2) {
            Calendar c = Calendar.getInstance();
            c.setTime(new SimpleDateFormat(YYYY_MM_DD).parse(sb.toString()));
            c.add(Calendar.MONTH, 0);
            c.set(Calendar.DATE, c.getActualMaximum(Calendar.DATE));
            DateFormat format = new SimpleDateFormat(YYYY_MM_DD);
            return format.format(c.getTime());
        }
        return sb.toString();
    }

    /**
     * 获取指定日期的月份
     *
     * @param s 日期
     * @return 月份
     */
    public static int getSpecifyDateMonth(String s) {
        try {
            Date date = new SimpleDateFormat(YYYY_MM_DD).parse(s);
            Calendar now = Calendar.getInstance();
            now.setTime(date);
            return now.get(Calendar.MONTH) + 1;
        } catch (ParseException e) {
            return 0;
        }
    }

    /**
     * 判断指定时间是否包含在指定日期区间
     *
     * @param time1
     * @param time2
     * @return boolean
     * @author Acechengui
     */
    public static boolean isSection(Date thistime, String time1, String time2) throws ParseException {
        //格式化
        SimpleDateFormat sim = new SimpleDateFormat(YYYY_MM_DD_HH_MM_SS);
        String s = sim.format(thistime);
        //把string类型的转换为long类型
        long l = sim.parse(s).getTime();
        //区间
        long start = sim.parse(time1).getTime();
        long end = sim.parse(time2).getTime();
        return l > start && l < end;
    }

    /**
     * 计算两个时间的小时差
     */
    public static long getDatehour(String beginTime, String endTime) {
        SimpleDateFormat dfs = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        try {
            Date begin = dfs.parse(beginTime);
            Date end = dfs.parse(endTime);
            long between = (end.getTime() - begin.getTime())/1000;
            return between/3600;
        }catch (Exception e){
            e.printStackTrace();
        }
        return 0;
    }

    /**
     * 流程完成时间处理
     *
     * @param ms 参数
     */
    public static String getProcessCompletionTime(long ms) {
        long day = ms / (24 * 60 * 60 * 1000);
        long hour = (ms / (60 * 60 * 1000) - day * 24);
        long minute = ((ms / (60 * 1000)) - day * 24 * 60 - hour * 60);
        long second = (ms / 1000 - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60);

        if (day > 0) {
            return day + "天" + hour + "小时" + minute + "分钟";
        }
        if (hour > 0) {
            return hour + "小时" + minute + "分钟";
        }
        if (minute > 0) {
            return minute + "分钟";
        }
        if (second > 0) {
            return second + "秒";
        } else {
            return 0 + "秒";
        }
    }

    /**
     获取昨天日期
     */
    public static Map<String, Integer> productionDate() {
        Map<String, Integer> pram = new HashMap<>();
        Calendar calendar = Calendar.getInstance();
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH) + 1;
        int date = calendar.get(Calendar.DATE);

        //如果是月初的话则返回上个月末的日期
        //否则返回昨天的日期
        if (date == 1) {
            month = month == 1 ? 12 : month - 1;
            switch (month) {
                case 1, 3, 5, 7, 8, 10, 12 -> date = 31;
                case 2 -> {
                    if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
                        date = 29;
                    } else {
                        date = 28;
                    }
                }
                case 4, 6, 9, 11 -> date = 30;
                default -> {
                }
            }
            if (month == 12 && date == 31) {
                year = year - 1;
            }
        } else {
            date = date - 1;
        }

        pram.put("year", year);
        pram.put("month", month);
        pram.put("date", date);
        return pram;
    }

    /**
     * 去年
     */
    public static String lastYear() {
        Calendar c = Calendar.getInstance();
        c.setTime(new Date());
        c.add(Calendar.YEAR, -1);
        int year = c.get(Calendar.YEAR);
        return String.valueOf(year);
    }

    public static Integer getDayNumForYear(Date date) {
        Calendar ca = Calendar.getInstance();
        ca.setTime(date);
        return ca.get(Calendar.DAY_OF_YEAR);
    }

    /**
     * 判断是否是昨天
     *
     * @param date 判断该日期是否是昨天
     * @return 是 true 不是 false
     */
    public static boolean isYesterday(Date date) {
        boolean flag = false;
        // 先获取年份
        int year = Integer.parseInt(new SimpleDateFormat("yyyy").format(date));

        // 获取当前年份 和 一年中的第几天
        int day = getDayNumForYear(date);
        int currentYear = Integer.parseInt(new SimpleDateFormat("yyyy").format(new Date()));
        int currentDay = getDayNumForYear(new Date());
        // 计算 如果是去年的
        if (currentYear - year == 1) {
            // 如果当前正好是 1月1日 计算去年有多少天，指定时间是否是一年中的最后一天
            if (currentDay == 1) {
                int yearDay;
                if (year % 400 == 0) {
                    // 世纪闰年
                    yearDay = 366;
                } else if (year % 4 == 0 && year % 100 != 0) {
                    // 普通闰年
                    yearDay = 366;
                } else {
                    // 平年
                    yearDay = 365;
                }
                if (day == yearDay) {
                    flag = true;
                }
            }
        } else {
            if (currentDay - day == 1) {
                flag = true;
            }
        }
        return flag;
    }

    /**
     * 计算时间差
     *
     * @param endDate 最后时间
     * @param startTime 开始时间
     * @return 时间差（天/小时/分钟）
     */
    public static String timeDistance(Date endDate, Date startTime)
    {
        long nd = 1000 * 24 * 60 * 60;
        long nh = 1000 * 60 * 60;
        long nm = 1000 * 60;
        // long ns = 1000;
        // 获得两个时间的毫秒时间差异
        long diff = endDate.getTime() - startTime.getTime();
        // 计算差多少天
        long day = diff / nd;
        // 计算差多少小时
        long hour = diff % nd / nh;
        // 计算差多少分钟
        long min = diff % nd % nh / nm;
        // 计算差多少秒//输出结果
        // long sec = diff % nd % nh % nm / ns;
        return day + "天" + hour + "小时" + min + "分钟";
    }
}
