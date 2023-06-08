var window_const;

var canvas = document.getElementById("c_canvas");
var pencil = canvas.getContext("2d");
var animation_control = document.getElementById("control");
var speed_control = document.getElementById("speed");
var speed_control_number = document.getElementsByClassName('meter-num');

var start_point;
var path_equ;
var box_collection = [
  {
    xl: 0,
    xr: 500,
    yt: 0,
    yb: 500,
    solid: 'OUT'
  },
  // {
  //   xl: 225,
  //   xr: 275,
  //   yt: 20,
  //   yb: 70,
  //   solid: 'IN'
  // }
];

var initial_position = {
  x: 250,
  y: 250,
};
var current_speed = 50;

draw_circle(250, 250);
// draw_block(225, 20);

function draw_circle(x, y) {
  pencil.beginPath();
  pencil.arc(x, y, 2, 0, 2 * Math.PI);
  pencil.stroke();
  pencil.fillStyle = "red";
  pencil.fill();
}

function remove_circle(x, y) {
  pencil.clearRect(x - 3, y - 3, 6, 6);
}

function draw_block(x, y, color){
  pencil.beginPath();
  pencil.lineWidth = '1';
  pencil.strokeStyle = color;
  pencil.rect(x, y, 50, 50);
  pencil.stroke();
}

function remove_block(x, y){
  pencil.clearRect(x, y, 50, 50);
}

function calc_pri() {
  let temp_sec = calc_sec(start_point?.pos);
  if(!ballWillBounce(start_point?.axis, start_point?.pos, start_point?.pos, temp_sec)){
    if (start_point?.dir === "+") {
      start_point.pos += 1;
    } else if (start_point?.dir === "-") {
      start_point.pos -= 1;
    }
  } else {
    re_calc_equ(start_point?.axis === "X" ? temp_sec : start_point?.pos);
    if (start_point?.dir === "+") {
      start_point.dir = "-";
      start_point.pos -= 1;
    } else if (start_point?.dir === "-") {
      start_point.dir = "+";
      start_point.pos += 1;
    }
  }
}

function calc_sec(primary_pos) {
  if (start_point?.axis === "X") {
    return path_equ?.m * primary_pos + path_equ?.c;
  } else if (start_point?.axis === "Y") {
    return (primary_pos - path_equ?.c) / path_equ?.m;
  }
}

function re_calc_equ(h) {
  path_equ = {
    m: path_equ?.m * -1,
    c: 2 * h - path_equ?.c,
  };
}

function start_animation() {
  animation_control.innerHTML = "Pause";
  window_const = window.setInterval(() => {
    let prev_sec = calc_sec(start_point?.pos);
    if(start_point?.axis === 'X'){
      remove_circle(start_point?.pos, prev_sec);
    }else if(start_point?.axis === 'Y'){
      remove_circle(prev_sec, start_point?.pos);
    }
    calc_pri();
    let now_sec = calc_sec(start_point?.pos);
    if(!ballWillBounce(start_point?.axis, now_sec, start_point?.pos, now_sec)){
      if(start_point?.axis === 'X'){
        draw_circle(start_point?.pos, now_sec);
      }else if(start_point?.axis === 'Y'){
        draw_circle(now_sec, start_point?.pos);
      }
    }else{
      if(start_point?.axis === 'X'){
        re_calc_equ(now_sec);
      }else if(start_point?.axis === 'Y'){
        re_calc_equ(start_point?.pos)
      }
    }
  }, Math.round(1000/current_speed));
}

function stop_animation() {
  animation_control.innerHTML = "Resume";
  window.clearInterval(window_const);
  window_const = null;
}

// ANIMATION CONTROL

animation_control.onclick = () => {
  if (start_point && path_equ) {
    if (window_const) {
      stop_animation();
    } else {
      start_animation();
    }
  }
};

// CANVAS ANIMATION

canvas.onclick = (event) => {
  stop_animation();

  let first_direction = {
    x: event?.offsetX,
    y: event?.offsetY,
  };

  if (start_point && path_equ) {
    initial_position = {
      x: start_point?.axis === 'X' ? start_point?.pos : calc_sec(start_point?.pos),
      y: start_point?.axis === 'Y' ? start_point?.pos : calc_sec(start_point?.pos)
    }
  }

  let temp_axis = Math.abs(first_direction?.y - initial_position?.y) <= Math.abs(first_direction?.x - initial_position?.x) ? 'X' : 'Y';

  start_point = {
    axis: temp_axis,
    dir: temp_axis === 'X' ? first_direction?.x > initial_position?.x ? '+' : '-' : first_direction?.y > initial_position?.y ? '+' : '-',
    pos: temp_axis === 'X' ? initial_position?.x : initial_position?.y
  }

  path_equ = {
    m:
      (first_direction.y - initial_position.y) /
      (first_direction.x - initial_position.x),
    c:
      (first_direction.x * initial_position.y -
        initial_position.x * first_direction.y) /
      (first_direction.x - initial_position.x),
  };
  
  start_animation();
};

// SPEED CONTROL

setValue(current_speed);
speed_control.onchange = (event) => {
  let temp_val = Math.round((event?.target?.value ?? 50)/10)*10;
  setValue(temp_val);
}

function setValue(val){
  speed_control.value = val;
  current_speed = val;
  if(start_point && path_equ){
    stop_animation();
    start_animation();
  }
}

for(let i = 0; i < 9; i++){
  let temp_ele = speed_control_number?.[i];
  temp_ele.onclick = () => {
    setValue((i+1)*10);
  }
}

// BOUNCING EDGE CALCULATION

function ballWillBounce(axis, value, primary_val, secondary_val){
  let output = false;
  let actual_pos = {
    x: axis === 'X' ? primary_val : secondary_val,
    y: axis === 'Y' ? primary_val : secondary_val
  }
  box_collection?.some((collection) => {
    if(axis === 'X' && collection?.solid === 'IN'){
      if(collection?.xl <= value && collection?.xr >= value){
        output = true;
      }
    }else if(axis === 'X' && collection?.solid === 'OUT'){
      if(collection?.xl >= value || collection?.xr <= value){
        output = true;
      }
    }else if(axis === 'Y' && collection?.solid === 'IN'){
      if(collection?.yt <= value && collection?.yb >= value){
        output = true;
      }
    }else if(axis === 'Y' && collection?.solid === 'OUT'){
      if(collection?.yt >= value || collection?.yb <= value){
        output = true;
      }
    }
    return output;
  });
  return output;
}