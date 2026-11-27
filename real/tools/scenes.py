N='/home/claude/env/new2/';L='/home/claude/env/old2/'
import re
def nf(i): return N+[l.split()[1] for l in open('/home/claude/lp/ix.txt')][i]
X=['christmas']
S={
# id: (file, seed, fits, tol)
'n08':(nf(8),(.56,.54),X,14),'n15':(nf(15),(.5,.57),X,14),'n26':(nf(26),(.52,.48),X,14),
'n33':(nf(33),(.5,.33),X,14),'n39':(nf(39),(.49,.37),X,14),
'l06':(L+'brick-wall-tree-wood-frame.jpg',(.30,.62),X,18),'l07':(L+'christmas-shelf-frame.jpg',(.5,.45),X,14),
'l08':(L+'christmas-wreath-wood-frame.jpg',(.59,.70),X,14),'l10':(L+'frame-candle-fairy-lights-reindeer.jpg',(.5,.51),X,10),
'l16':(L+'mantel-garland-white-frame.jpg',(.51,.29),X,10),'l24':(L+'side-table-tree-black-frame.jpg',(.46,.36),X,14),
'l34':(L+'white-frame-candy-cane-vase.jpg',(.45,.77),X,10),'l35':(L+'white-frame-pine-ornaments-table.jpg',(.5,.57),X,10),
'n01':(nf(1),(.55,.45),['travel','nature','dreamy'],14),'n02':(nf(2),(.6,.55),['travel'],12),
'n04':(nf(4),(.5,.5),['coastal','dreamy','nature'],14),'n06':(nf(6),(.5,.29),['travel','nature','coastal'],14),
'n11':(nf(11),(.68,.46),['travel','city'],14),'n13':(nf(13),(.30,.62),['coastal'],14),
'n14':(nf(14),(.57,.48),['coastal','travel'],14),'n17':(nf(17),(.47,.52),['travel','city'],14),
'n20':(nf(20),(.49,.67),['nature'],14),'n21':(nf(21),(.51,.55),['coastal'],10),
'n24':(nf(24),(.48,.47),['city','travel'],14),'n27':(nf(27),(.26,.51),['coastal'],14),
'n30':(nf(30),(.46,.57),['nature','dreamy','travel'],14),'n31':(nf(31),(.47,.43),['city'],14),
'n32':(nf(32),(.5,.43),['city','travel'],14),'n35':(nf(35),(.46,.43),['nature','travel'],14),
'n36':(nf(36),(.49,.56),['city','travel'],18),'n38':(nf(38),(.61,.32),['travel','dreamy','nature'],14),
'n40':(nf(40),(.42,.61),['travel'],14),'n43':(nf(43),(.49,.43),['travel','dreamy','coastal'],14),
'n45':(nf(45),(.40,.80),['nature','dreamy','coastal'],14),'n46':(nf(46),(.5,.28),['travel','nature','dreamy'],14),
'n47':(nf(47),(.78,.46),['nature','travel'],14),'n48':(nf(48),(.48,.53),['travel','dreamy','nature'],14),
'n49':(nf(49),(.5,.52),['coastal','nature'],12),'n52':(nf(52),(.54,.58),['travel','nature'],14),
'n54':(nf(54),(.5,.36),['travel','dreamy','nature'],14),'n56':(nf(56),(.48,.49),['nature','travel','dreamy'],18),
'l01':(L+'boho-bedroom-green-wall.jpg',(.52,.31),['travel','nature','dreamy'],14),
'l02':(L+'boho-bedroom-tan-wall.jpg',(.43,.55),['dreamy','nature','travel'],14),
'n03':(nf(3),(.45,.44),['kids'],14),'n07':(nf(7),(.62,.31),['kids'],14),'n18':(nf(18),(.52,.58),['kids'],14),
'n19':(nf(19),(.53,.54),['kids'],14),'n22':(nf(22),(.54,.48),['kids'],14),'n51':(nf(51),(.36,.37),['kids'],14),
'l21':(L+'nursery-play-tent-frame.jpg',(.45,.53),['kids'],14),'l22':(L+'pastel-girls-bedroom-frame.jpg',(.47,.29),['kids'],14),
}
def n3(i): return [l.split()[1] for l in open('/home/claude/lp/ix3.txt')][i]
S.update({
't01':(n3(1),(.34,.64),['travel','nature'],14),'t02':(n3(2),(.60,.54),['travel','nature','dreamy'],12),
't13':(n3(13),(.60,.33),['travel','city'],14),'t15':(n3(15),(.50,.34),['travel','nature'],14),
't17':(n3(17),(.44,.24),['travel','dreamy'],14),'t18':(n3(18),(.52,.28),['travel','city'],14),

})
def nb(i): return [l.split()[1] for l in open('/home/claude/lp/ixb.txt')][i]
def _nbn(pre): return next(f for f in [l.split()[1] for l in open('/home/claude/lp/ixb.txt')] if pre in f)
SP=['sports']
S.update({
's_den':(L+'vintage-den-baseball-blueprint.jpg',(.437,.115,.708,.715),SP,30),
's_rack':(L+'teen-room-rackets-blank-frames.jpg',(.165,.235),SP,14),
's_dart':(nf(25),(.70,.21),SP,14),
's_gym':(nf(0) if False else [l.split()[1] for l in open('/home/claude/lp/ix3.txt')][11],(.393,.046,.641,.64),SP,6),
's_H':(_nbn('bedroom-with-'),(.33,.33),SP,14),
's_F':(_nbn('light-filled'),(.52,.18),SP,14),
's_G':(_nbn('blank-frame-w'),(.40,.45),SP,10),
})
