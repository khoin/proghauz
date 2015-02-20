
/**
 * @author potasmic
 * @name proghauz
 */
import {Saw} from 'opendsp/wavetable-osc';
import lp from 'opendsp/diodefilter';
import note from 'opendsp/note';
import env from 'opendsp/envelope';
import Chord from 'stagas/chords';
import debug from 'debug';

var log = debug("Log:");

var bpm = 123/60;
var spb = 60/123;

var lp1 = lp();
var lp2 = lp();
var oscs = [Saw(), Saw(), Saw()];
var patt = [1];//[1,0.5,0.3,1,0.5];

var chords = ["Bbmaj9","Abmaj7","Gmin9","Fmaj9"].map(Chord);
var sub    = ["Bb", "Ab", "G", "F"].map(function(a) {
  return Chord(a)[0]; 
});

export function dsp(t) {
  var barp = Math.floor(t/(60/(bpm*60)*4));
  
  var chord = chords[barp%chords.length]; 
  
  var synth = [0,0];
  for( var j=0; j < 3; j++) {
    for (var i = 0; i < chord.length; i++) {
       synth[0] += 1/12 * (Math.sin(t *(Math.pow(2,j+2))*Math.PI* 2 * note(chord[i]) ) > 0.25); 
    }
  }
  
  synth[0] = 1-2*synth[0]; synth[1] = synth[0]; 
  
  var cutmod = Math.sin(Math.PI*2 * t * 0.03)*30;
  lp1.cut(0.25+0.73*env(t*bpm,1/16,45+cutmod,0)).res(0.08).hpf(0);
  lp2.cut(0.25+0.73*env(t*bpm,1/16,45+cutmod,0)).res(0.08).hpf(0.8);
  synth[0] = lp1.run(synth[0]) * patt[Math.floor(t/(spb/4))%patt.length] ; 
  synth[1] = lp2.run(synth[1]) * patt[Math.floor(t/(spb/4))%patt.length] ;
  
  var kick = Math.sin( t * Math.PI*2 * (0.02*env(bpm*t,1/4,80,0)) ) * env(bpm*t,1/4,56,0);
  var hat  = Math.random() * env(bpm*t,1/16,66,0) * [0,0.3,1,0.2][Math.floor(t/(spb/4))%4] ;
  var snare = ( (Math.random() >0.8) * env(bpm*t,1/4,66,0) * [0,0,0,0,1,0,0,0][Math.floor(t/(spb/4))%8] );
  var subb = Math.sin( Math.PI*4* t * note( sub[Math.floor(t/(spb*4))%4] ));
      subb = Math.min(0.45,Math.max(-0.45,subb));
  
  
  var outl = synth[0] * (1-env(t*bpm,1/4,20,0)) * env(t*bpm,1/16,55,0) * 0.5  
  + kick * 0.3 
  + hat * 0.13 
  + snare * 0.2
  + subb * 0.13;
  var outr = synth[1] * (1-env(t*bpm,1/4,20,0)) * env(t*bpm,1/16,55,0) * 0.5  
  + kick * 0.3 
  + hat * 0.13 
  + snare * 0.2;
  + subb * 0.13;
  return [outl,outr] ;
}
