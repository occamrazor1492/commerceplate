interface SkeletonCardsProps {
  columns?: number; // u5217u6570
  products?: number; // u4ea7u54c1u6570u91cf
}

const SkeletonCards = ({ columns = 3, products = 9 }: SkeletonCardsProps) => {
  // u57fau4e8eu5217u6570u751fu6210u7f51u683cu6837u5f0f
  let gridClass = "grid gap-4 ";
  
  switch(columns) {
    case 1: 
      gridClass += "grid-cols-1";
      break;
    case 2:
      gridClass += "sm:grid-cols-2";
      break;
    case 3:
      gridClass += "sm:grid-cols-2 lg:grid-cols-3";
      break;
    case 4:
      gridClass += "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      break;
    case 5:
      gridClass += "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
      break;
    default:
      gridClass += "sm:grid-cols-2 lg:grid-cols-3";
  }
  
  return (
    <section>
      <div className="container">
        <div className="row gy-4">
          <div className="col-12 mx-auto">
            <div>
              <div className={gridClass}>
                {Array(products)
                  .fill(0)
                  .map((_, index) => {
                    return (
                      <div key={index}>
                        <div className="h-[200px] md:h-[269px] rounded-md animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                        <div className="flex flex-col justify-center items-center">
                          <div className="mt-4 w-24 h-3 rounded-full animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>
                          <div className="mt-2 w-16 h-2 rounded-full animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkeletonCards;
