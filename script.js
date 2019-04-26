const parseDate = d3.timeParse("%Y-%m-%d"),
    bisectDate = d3.bisector(d => d.month).left;
    margin = {left: 50, right: 20, top: 20, bottom: 50 },

    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,

    xNudge = 50,
    yNudge = 20,

    psv = d3.dsvFormat(",");

d3.text("data.csv").then(function(data) {
    const data_prepare= data.replace(/ /g,'\n'),
    rows = psv.parse(data_prepare, processRow)
    drawChart(rows, "s1", "Регистрации")
    drawChart(rows, "s2", "Комментарии")
    drawChart(rows, "s6", "Статьи")
});

function drawChart(rows, columnName, title){
    const max = d3.max(rows, d => d[columnName]),
    minDate = d3.min(rows, d => d.month),
    maxDate = d3.max(rows, d => d.month),

    y = d3.scaleLinear()
        .domain([0,max])
        .range([height,0]),

    x = d3.scaleTime()
        .domain([minDate,maxDate])
        .range([0,width]),

    yAxis = d3.axisLeft(y),

    xAxis = d3.axisBottom(x),

    line = d3.area()
        .x(function(d){ return x( d.month); })
        .y0(y(0))
        .y1(function(d){ return y(d[columnName]); })
        .curve(d3.curveStep);

    d3.select("body").append("h1").text(title)
   const svg = d3.select("body").append("svg").attr("id","svg").attr("height","400").attr("width","100%");
   const chartGroup = svg.append("g").attr("class","chartGroup").attr("transform","translate("+xNudge+","+yNudge+")");

    chartGroup.append("path")
        .attr("class","line")
        .attr("d",function(d){ return line(rows); })

    chartGroup.append("g")
        .attr("class","axis x")
        .attr("transform","translate(0,"+height+")")
        .call(xAxis);

    chartGroup.append("g")
        .attr("class","axis y")
        .call(yAxis);

    const focus = chartGroup.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", width)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 5);

    focus.append("text")
        .attr("x", 0)
        .style("text-anchor", "middle")
        .attr("dy", "-.8em");

    svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(rows, x0, 1),
            d0 = rows[i - 1],
            d1 = rows[i],
            d = x0 - d0.month > d1.month - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.month) + "," + y(d[columnName]) + ")");
        focus.select("text").text(function() { return d[columnName]; });
        focus.select(".x-hover-line").attr("y2", height - y(d[columnName]));
        focus.select(".y-hover-line").attr("x2", width + width);
    }
}

    function processRow(d) {
        return {
            month: parseDate(d.month),
            s1:+d.s1,
            s2:+d.s2,
            s6:+d.s6
        };
    }
