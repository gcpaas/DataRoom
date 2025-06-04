import { VChart } from "@visactor/vchart";
const hexToRgba = (hex, opacity) => {
  return (
    "rgba(" +
    parseInt("0x" + hex.slice(1, 3)) +
    "," +
    parseInt("0x" + hex.slice(3, 5)) +
    "," +
    parseInt("0x" + hex.slice(5, 7)) +
    "," +
    opacity +
    ")"
  );
};
export const setDataRoomTheme = async () => {
  // step1.1: bar mark gradient callback
  const gradientCallback = (datum, ctx, type) => {
    // console.log("ctx.seriesColor(datum.type)", ctx.seriesColor(datum.type));
    const isHorizontal =
      ctx.vchart?._spec?.direction &&
      ctx.vchart._spec.direction === "horizontal";
    // console.log("ctx.vchart.spec.direction", ctx.vchart._spec?.direction);
    return {
      gradient: "linear",
      x0: isHorizontal ? 1 : 0,
      y0: 0,
      x1: 0,
      y1: isHorizontal ? 0 : 1,
      stops: [
        {
          offset: 0,
          fillOpacity: 0,
          color: hexToRgba(ctx.seriesColor(datum.type), 1),
        },
        {
          offset: 1,
          fillOpacity: 1,
          color: hexToRgba(ctx.seriesColor(datum.type), 0),
        },
      ],
    };
  };
  // step1.2: define and register theme
  const theme = {
    series: {
      bar: {
        bar: {
          style: {
            fill: (datum, ctx) => gradientCallback(datum, ctx, "fill"),
            stroke: (datum, ctx) => gradientCallback(datum, ctx, "stroke"),
            lineWidth: 2,
          },
        },
      },
      line: {
        point: {
          style: {
            lineWidth: 0,
          },
        },
      },
      area: {
        point: {
          style: {
            visible: false,
            lineWidth: 0,
          },
        },
        area: {
          style: {
            fill: (datum, ctx) => gradientCallback(datum, ctx, "fill"),
            stroke: (datum, ctx) => gradientCallback(datum, ctx, "stroke"),
            lineWidth: 2,
          },
        },
      },
    },
    component: {
      axis: {
        grid: {
          visible: true,
          style: {
            stroke: "rgba(255,255,255,0.15)",
            lineWidth: 1,
          },
        },
        label: {
          visible: true,
          style: {
            angle: 0,
            fill: "rgba(255,255,255,0.65)",
            fontFamily: "D-DIN",
            fontSize: 12,
            fontWeight: "normal",
          },
        },
        domainLine: {
          visible: false,
          style: {
            stroke: "rgba(0,0,0,0)",
          },
        },
        title: {
          visible: false,
        },
      },
      crosshair: {
        xField: {
          line: {
            style: {
              opacity: 0.2,
            },
          },
        },
        yField: {
          line: {
            style: {
              opacity: 0.2,
            },
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        panel: {
          backgroundColor: "rgba(0,0,0,0.8)",
        },
        titleLabel: {
          fontColor: "rgba(255,255,255,0.65)",
        },
        keyLabel: {
          fontColor: "rgba(255,255,255,0.65)",
        },
        valueLabel: {
          fontColor: "rgba(255,255,255,0.65)",
        },
      },
    },
  };
  // step2: register theme
  VChart.ThemeManager.registerTheme("DataRoomTheme", theme);
  // step3: set theme
  VChart.ThemeManager.setCurrentTheme("DataRoomTheme");
};

export const setDarkTheme = () => {
  VChart.ThemeManager.setCurrentTheme("dark");
};
