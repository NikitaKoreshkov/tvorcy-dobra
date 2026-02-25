'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function AboutSection() {
  const t = useTranslations('about');
  const ref = useRef(null);
  const textImageRef = useRef(null);
  const blocksRef = useRef(null);
  
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView = useInView(ref, viewOptions);
  const isTextImageInView = useInView(textImageRef, viewOptions);
  const isBlocksInView = useInView(blocksRef, viewOptions);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
  };

  const fadeInUpStagger = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99] 
      }
    }
  };

  return (
    <section className="about-section" ref={ref}>
      <div className="about-container">
        {/* Main Content */}
        <div className="about-content">
          <motion.h2 
            className="about-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            {t('title')}
          </motion.h2>
          <motion.div 
            ref={textImageRef}
            className="about-text-image-wrapper"
            initial="hidden"
            animate={isTextImageInView ? "visible" : "hidden"}
            variants={{
              visible: {
                transition: { staggerChildren: 0.15 }
              }
            }}
          >
            <motion.div 
              className="about-text"
              variants={fadeInUp}
            >
              <div className="about-paragraphs">
                <motion.p 
                  className="about-paragraph"
                  variants={fadeInUp}
                >
                  {t('paragraph1')}
                </motion.p>
                <motion.p 
                  className="about-paragraph"
                  variants={fadeInUp}
                >
                  {t('paragraph2')}
                </motion.p>
                <motion.p 
                  className="about-paragraph"
                  variants={fadeInUp}
                >
                  {t('paragraph3')}
                </motion.p>
              </div>
            </motion.div>
            
            {/* Team/Process Image */}
            <motion.div 
              className="about-image-wrapper"
              variants={fadeInUp}
            >
              <div className="about-image-container">
                <Image
                  src="/images/1.jpg"
                  alt={t('imagePlaceholder')}
                  fill
                  className="about-image"
                  quality={85}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Values & Focus Blocks */}
        <motion.div 
          ref={blocksRef}
          className="about-blocks"
          initial="hidden"
          animate={isBlocksInView ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: { staggerChildren: 0.2, delayChildren: 0.1 }
            }
          }}
        >
          <motion.div 
            className="about-block"
            variants={fadeInUp}
          >
            <h3 className="about-block-title">{t('valuesTitle')}</h3>
            <motion.ul 
              className="about-block-list"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              <motion.li 
                className="about-block-item"
                variants={fadeInUpStagger}
              >
                {t('value1')}
              </motion.li>
              <motion.li 
                className="about-block-item"
                variants={fadeInUpStagger}
              >
                {t('value2')}
              </motion.li>
              <motion.li 
                className="about-block-item"
                variants={fadeInUpStagger}
              >
                {t('value3')}
              </motion.li>
              <motion.li 
                className="about-block-item"
                variants={fadeInUpStagger}
              >
                {t('value4')}
              </motion.li>
            </motion.ul>
          </motion.div>

          <motion.div 
            className="about-block"
            variants={fadeInUp}
          >
            <h3 className="about-block-title">{t('focusTitle')}</h3>
            <motion.ul 
              className="about-block-list"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              <motion.li 
                className="about-block-item"
                variants={fadeInUpStagger}
              >
                {t('focus1')}
              </motion.li>
              <motion.li 
                className="about-block-item"
                variants={fadeInUpStagger}
              >
                {t('focus2')}
              </motion.li>
              <motion.li 
                className="about-block-item"
                variants={fadeInUpStagger}
              >
                {t('focus3')}
              </motion.li>
              <motion.li 
                className="about-block-item"
                variants={fadeInUpStagger}
              >
                {t('focus4')}
              </motion.li>
            </motion.ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

