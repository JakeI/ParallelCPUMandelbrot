onmessage = function (e){
	draw(e.data);
}

//WTF!!
var redC = [ -2111869.5, 8752267.5, -14678915, 12706491, -5967405.3, 1445353.4, 
	  -150845.38, 5146.0084, 32, 0 ];
var greenC = [ -727109.37, 3096999.4, -5491512.5, 5357197.3, -3239942.1,
	  1289499.1, -323075.28, 38166.498, 32, 0 ];
var blueC = [ -8564360.1, 39125204, -74269873, 75711467, -44656778, 15235382,
	  -2798082.4, 217263.71, 32, 0 ];

function draw(param){
	
	var M = param.M;
	var bSq = param.bSq;
	var w = param.w;
	var h = param.h;
	var dim = param.dim;
	var exponent = param.exponent;
	var startAt = param.startAt;
	var endAt = param.endAt;
	var id = param.id;
	var p1 = param.p1;
	
	
	var colConst = 255/M;
	var xConst = (dim.r-dim.l)/w;
	var yConst = ((dim.b-dim.t)/h);
	var l = endAt-startAt;
	var update = (l/80);
	var data = new Uint8ClampedArray(l);
	
	for(var j = startAt; j < endAt; j+=4){
		var px = j/4;
		var y = Math.floor(px/w);
		var x = Math.floor(px-(y*w));
		if(px%update == 0){
			postMessage({msg:2, data:((j-startAt)/l), id:(id)});
		}
		var i = Math.floor(j-startAt);
		var z = {re:(xConst*x+dim.l), im:((yConst*y)+dim.t)};
		//z = times(times(z, {re:5, im:-10}), ln(z));//scaleXY(z, z.im, 1);//scale(z, 20);//turnBy(z, Math.PI*2/3);//pow(z, {re:0.5, im:0});
		var c = Convergent(z, exponent, {M:M, bSq:bSq})//1.0-ConvergentTo(z, exponent, {M:M, bSq:bSq, to:p1});//1-NewtonConvertentGeneralised(z, {M:M, b:bSq});//1-ConvergentArg(z, exponent, {M:M, bSq:bSq});//
		data[i+1] = poly(c, greenC);
		data[i+2] = poly(c, blueC);
		data[i+3] = 255;
	}
	postMessage({msg:2, data:(1.0), id:(id)});
	postMessage({msg:(1) ,data:(data), id:id, startAt:startAt, endAt:endAt});
}

//------
function sum(a, b){//return a+b, a,b element of C
	return { re:(a.re+b.re), im:(a.im+b.im) };
}

function absSq(z){
	return z.re*z.re + z.im*z.im;
}

function abs(z){
	return Math.sqrt(z.re*z.re + z.im*z.im);
}

function times(z, lamda){
	if (typeof lamda == "number"){
		return {re:(lamda*z.re), im:(lamda*z.im) };
	}else{
		return {re:(z.re*lamda.re-z.im*lamda.im), im:(z.re*lamda.im+z.im*lamda.re)};
	}
}

function poly(x, coeff){
	var y = coeff[0]*x;
	var n = coeff.length-1;
	for(var i=1; i<n; i++){
		y = (y+coeff[i])*x;
	}
	return Math.floor(y + coeff[n]);
}

function complement(z){
	return {re:(z.re), im:(-z.im)};
}

function resiprical(z){
	return times(z, 1/absSq(z));
}

function pow(a, b){//return a^b, a,b element of C
	var lnR = 0.5*Math.log(absSq(a));
	var phi = Math.atan2(a.im, a.re);
	var expo = Math.exp(b.re*lnR-b.im*phi);
	var angel = b.re*phi + b.im*lnR;
	return { re:(expo*Math.cos(angel)), im:(expo*Math.sin(angel)) };
}

function exp(z){
	var r = Math.exp(z.re);
	return {re:(r*Math.cos(z.im)), im:(r*Math.sin(z.im))};
}

function ln(z){
	return {re:Math.log(Math.sqrt(z.re*z.re+z.im*z.im)), im:Math.atan2(z.im, z.re)};
}

function turnBy(z, phi){
	var theta = Math.atan2(z.im, z.re)+phi;
	var r = Math.sqrt(z.re*z.re+z.im*z.im);
	//r = Math.pow(r, 1);
	return {re:(r*Math.cos(theta)), im:(r*Math.sin(theta))};
}

function scale(z, lamda){
	var theta = Math.atan2(z.im, z.re);
	var r = Math.sqrt(z.re*z.re+z.im*z.im);
	r *= lamda;
	return {re:(r*Math.cos(theta)), im:(r*Math.sin(theta))};
}

function scaleXY(z, x, y){
	return {re:z.re*x, im:z.im*y};
}

function divide(u, v){
	var factor = 1/((v.re*v.re)+(v.im*v.im));
	return {re:(factor*((u.re*v.re)+(u.im*v.im))), im:(factor*((u.im*v.re)-(v.im*u.re)))};
}

function subtrct(u, v){
	return {re:(u.re-v.re), im:(u.im-v.im)};
}

function timesi(z){
	return {re:-z.im, im:z.re};
}

function expix(x){
	return {re:Math.cos(x), im:Math.sin(x)};
}

function sin(z){
	var exponent = timesi(z);
	return times(sum(exp(exponent), exp(times(exponent,-1))),0.5);
}

function cos(z){
	var exponent = timesi(z);
	return times(subtrct(exp(exponent), exp(times(exponent,-1))),{re:0, im:-0.5});
}

function f(z){
	return sum(pow(z, 3), z);
}


//Semi-Complex Numbers

function scnAbsSq(z){
	return((z.re*z.re)-(z.im*z.im));
}

function scnSq(z){
	return {re:((z.re*z.re)+(z.im*z.im)), im:(2*z.re*z.im)};
}

function scnSum(u, v){
	return {re:(u.re+v.re), im:(u.im+v.im)};
}

//End: Semi-Complex Number

var Epsilon = 0.0001;
function eq(u,v){
	return (u.re < v.re+Epsilon) && (u.re > v.re-Epsilon) &&
				(u.im < v.im+Epsilon) && (u.im > v.im-Epsilon);
}

function eq(u,v,epsilon){//u,v element of C
	return u < v+epsilon && u > v-epsilon;
}

function C2R(z){
	return z.re*z.re+z.im*z.im;//z.re*z.re-z.im*z.im;//
}

/*function complexPoly(z, coeff){
	var y = times(z, coeff[0]);
	var n = coeff.length-1;
	for(var i=1; i<n; i++){
		y = times(sum(y, coeff[i]), z);
	}
	return sum(y, coeff[n]);
}*/

/*function complexPolyDiv(z, coeff){
	var y = times(z, coeff[0]);
	var n = coeff.length-1;
	for(var i=1; i<n; i++){
		y = times(sum(y, coeff[i]), z);
	}
	return sum(y, coeff[n]);
}*/

//var polynom = [3, 0, 0, 1];
//var derividiv = [9, 0, 0];


var root1 = {re:1, im:0};
var root2 = {re:Math.cos(2*Math.PI/3), im:Math.sin(2*Math.PI/3)};
var root3 = {re:Math.cos(4*Math.PI/3), im:Math.sin(4*Math.PI/3)};
/*var root4 = {re:Math.cos(6*Math.PI/5), im:Math.sin(6*Math.PI/5)};
var root5 = {re:Math.cos(8*Math.PI/5), im:Math.sin(8*Math.PI/5)};*/

var power = 3;

function NewtonConvertent(c, param){
	var z = { re:c.re, im:c.im };
	for(var i=0; i<=param.M; i++){
		z = subtrct(z,  divide( subtrct(pow(z, {re:power, im:0}), {re:1, im:0}), 
				times(pow(z, {re:power-1, im:0}), power)));
		if(/*absSq(z) > param.b*/
			eq(z, root1) || eq(z, root2) || eq(z, root3) || eq(z, root4))
			return i/param.M;
	}
	return 1.0;
}

function NewtonConvertentReatchted(c, param){
	var z = { re:c.re, im:c.im };
	for(var i=0; i<=param.M; i++){
		z = subtrct(z,  times(divide( subtrct(pow(z, {re:power, im:0}), {re:1, im:0}), 
				times(pow(z, {re:power-1, im:0}), power)), 1));
		if(eq(z, root1))
			return 0.1;
		else if(eq(z, root2))
			return 0.2;
		else if(eq(z, root3))
			return 0.3;
		/*else if(eq(z, root4))
			return 0.4;
		else if(eq(z, root5))
			return 0.5;*/
	}
	return 1.0;
}
function NewtonConvertentGeneralised(c, param){
	var z = { re:c.re, im:c.im };
	for(var i=0; i<=param.M; i++){
		/*z = subtrct(z,  times(divide( subtrct(pow(z, {re:4, im:3}), {re:1, im:0}), 
				times(pow(z, {re:3, im:3}), {re:4, im:3})), {re:-2.1, im:2.1}));*/
		/*z = subtrct(
				z, 
					times(
						divide(
							sin(z)
						,
							cos(z)
						)
					,
						{re:1, im:0}
					)
				);*/
		z = divide(
				subtrct(
					times(
						z
					,
						cos(z)	
					)
				,
					sum(
						sin(z)
					,
						{re:1, im:0}
					)
				)
			,
				cos(z)
			);
	}
	return (Math.atan2(z.im, z.re)+(Math.PI))/(2*Math.PI);
}

function ConvergentTo(c, lamda, param){
	var z = { re:c.re, im:c.im };
	for(var i=0; i<=param.M; i++){
		z = sum(pow(z, lamda), c);
		if(eq(C2R(z), param.to, param.bSq))
			return i/param.M;
	}
	return 1.0;
}

function ConvergentArg(c, lamda, param){
	var z = { re:c.re, im:c.im };
	for(var i=0; i<=param.M; i++){
		z = sum(pow(z, lamda), c);
	}
	return (Math.atan2(z.im, z.re)+(Math.PI))/(2*Math.PI); 
}

function Convergent(c, lamda, param){
	/*
	//3n+1
	for(var i=0; i<=M; i++){
		var f = Math.round(abs(c));
		if(f == 1){
			return i/M;
		}else if(f%2 == 0){
			c = times(c, 0.5);
		}else{
			c = sum(times(c, 3), {re:1, im:0});
		}
	}
	return 1.0;
	*/
	
	
	//Mandelbrod Original
	
	/*var z = { re:c.re, im:c.im };
	for(var i=0; i<=M; i++){
		z = sum(pow(z, lamda), c);
		if(absSq(z) > bSq)
			return i/M;
	}
	return 1.0;*/
	
	var z = { re:c.re, im:c.im };
	for(var i=0; i<=param.M; i++){
		z = sum(pow(z, lamda), c);
		if(C2R(z) > param.bSq)
			return i/param.M;
	}
	return 1.0;
	
	
	
	
	//Mandelbrod Dirividiv test
	/*var z1 = c;
	var z2 = sum(pow(z1, lamda), c);
	var z3 = sum(pow(z2, lamda), c);
	
	var y1 = abs(z1);
	var y2 = abs(z2);
	var y3 = abs(z3);
	
	var d1 = (y3-y1)/2;
	var d2 = (d1-y2)*2;
	
	return d1 <= 0 && d2 <= 0 ? 0 : 1;*/
	
}
//------