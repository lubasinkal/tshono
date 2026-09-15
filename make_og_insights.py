from PIL import Image, ImageDraw, ImageFont
W,H = 1200,630
bg=(6,9,13); white=(242,245,249); muted=(139,150,168); faint=(91,102,120); green=(74,222,128); line=(27,36,50)
img=Image.new('RGB',(W,H),bg); d=ImageDraw.Draw(img)
F=lambda n,b=True: ImageFont.truetype(f'public/fonts/SpaceMono-{"Bold" if b else "Regular"}.ttf',n)
d.text((80,64),'tshono',font=F(52),fill=white)
w=d.textbbox((0,0),'tshono',font=F(52))[2]
d.ellipse([80+w+8,64+38,80+w+22,64+52],fill=green)
t='HIRING DATA'; bb=d.textbbox((0,0),t,font=F(30,False))
d.text((W-80-(bb[2]-bb[0]),76),t,font=F(30,False),fill=muted)
d.text((80,220),'Insights',font=F(150),fill=white)
hw=d.textbbox((0,0),'Insights',font=F(150))[2]
d.ellipse([80+hw+18,220+118,80+hw+48,220+148],fill=green)
d.text((84,420),'Explore jobs data across Botswana.',font=F(34,False),fill=muted)
d.line([(0,H-130),(W,H-130)],fill=line,width=2)
d.ellipse([80,H-88,104,H-64],fill=green)
d.text((124,H-92),'LIVE SECTORS',font=F(32),fill=white)
s='EDUCATION  -  MINING  -  FINANCE'
d.text((420,H-90),s,font=F(28,False),fill=muted)
img.save('public/og-insights.png')
print('saved')
